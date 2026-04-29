<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $totalUsers = User::where('tenant_id', $tenantId)->count();
        $totalProjects = Project::where('tenant_id', $tenantId)->count();
        $activeProjects = Project::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();
        $totalTasks = Task::where('tenant_id', $tenantId)->count();
        $completedTasks = Task::where('tenant_id', $tenantId)
            ->where('status', 'done')
            ->count();
        $pendingTasks = Task::where('tenant_id', $tenantId)
            ->whereIn('status', ['todo', 'in_progress'])
            ->count();

        $recentProjects = Project::where('tenant_id', $tenantId)
            ->latest()
            ->take(5)
            ->get();

        $recentTasks = Task::where('tenant_id', $tenantId)
            ->with(['project:id,name', 'assignee:id,name,role'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'total_users' => $totalUsers,
            'total_projects' => $totalProjects,
            'active_projects' => $activeProjects,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'pending_tasks' => $pendingTasks,
            'recent_projects' => $recentProjects,
            'recent_tasks' => $recentTasks,
        ]);
    }
}
