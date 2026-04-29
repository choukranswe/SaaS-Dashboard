<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $projects = Project::where('tenant_id', $request->user()->tenant_id)
            ->with(['creator:id,name,email,role'])
            ->withCount('tasks')
            ->latest()
            ->get();

        return response()->json($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['pending', 'active', 'completed'])],
        ]);

        $project = Project::create([
            'tenant_id' => $request->user()->tenant_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Project created successfully.',
            'data' => $project->load('creator:id,name,email,role'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $project = Project::where('tenant_id', $request->user()->tenant_id)
            ->with(['creator:id,name,email,role'])
            ->withCount('tasks')
            ->findOrFail($id);

        return response()->json($project);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $project = Project::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['pending', 'active', 'completed'])],
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully.',
            'data' => $project->load('creator:id,name,email,role'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $project = Project::where('tenant_id', $request->user()->tenant_id)->findOrFail($id);
        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully.',
        ]);
    }
}
