<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $tasks = Task::where('tenant_id', $request->user()->tenant_id)
            ->with(['project:id,name,status', 'assignee:id,name,email,role'])
            ->latest()
            ->get();

        return response()->json($tasks);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $validated = $request->validate([
            'project_id' => [
                'required',
                'integer',
                Rule::exists('projects', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'assigned_to' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['todo', 'in_progress', 'done'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high'])],
            'due_date' => ['nullable', 'date'],
        ]);

        $task = Task::create([
            'tenant_id' => $tenantId,
            'project_id' => $validated['project_id'],
            'assigned_to' => $validated['assigned_to'] ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'priority' => $validated['priority'],
            'due_date' => $validated['due_date'] ?? null,
        ]);

        return response()->json([
            'message' => 'Task created successfully.',
            'data' => $task->load(['project:id,name,status', 'assignee:id,name,email,role']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $task = Task::where('tenant_id', $request->user()->tenant_id)
            ->with(['project:id,name,status', 'assignee:id,name,email,role'])
            ->findOrFail($id);

        return response()->json($task);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $tenantId = $request->user()->tenant_id;
        $task = Task::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'project_id' => [
                'sometimes',
                'integer',
                Rule::exists('projects', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'assigned_to' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('tenant_id', $tenantId)),
            ],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['todo', 'in_progress', 'done'])],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high'])],
            'due_date' => ['nullable', 'date'],
        ]);

        $task->update($validated);

        return response()->json([
            'message' => 'Task updated successfully.',
            'data' => $task->load(['project:id,name,status', 'assignee:id,name,email,role']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $task = Task::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully.',
        ]);
    }
}
