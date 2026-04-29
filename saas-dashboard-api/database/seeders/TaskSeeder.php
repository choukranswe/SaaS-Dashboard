<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pixelWeb = Tenant::where('slug', 'pixelweb')->firstOrFail();
        $techNova = Tenant::where('slug', 'technova')->firstOrFail();

        $pixelManager = User::where('tenant_id', $pixelWeb->id)->where('role', User::ROLE_MANAGER)->firstOrFail();
        $techManager = User::where('tenant_id', $techNova->id)->where('role', User::ROLE_MANAGER)->firstOrFail();

        $pixelProject = Project::where('tenant_id', $pixelWeb->id)->firstOrFail();
        $techProject = Project::where('tenant_id', $techNova->id)->firstOrFail();

        $tasks = [
            [
                'tenant_id' => $pixelWeb->id,
                'project_id' => $pixelProject->id,
                'assigned_to' => $pixelManager->id,
                'title' => 'Create homepage wireframes',
                'description' => 'Prepare desktop and mobile wireframes for homepage.',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => Carbon::now()->addDays(5)->toDateString(),
            ],
            [
                'tenant_id' => $pixelWeb->id,
                'project_id' => $pixelProject->id,
                'assigned_to' => $pixelManager->id,
                'title' => 'Define SEO metadata plan',
                'description' => 'Outline metadata requirements for all key pages.',
                'status' => 'todo',
                'priority' => 'medium',
                'due_date' => Carbon::now()->addDays(10)->toDateString(),
            ],
            [
                'tenant_id' => $techNova->id,
                'project_id' => $techProject->id,
                'assigned_to' => $techManager->id,
                'title' => 'Set up API contracts',
                'description' => 'Finalize request/response schema with frontend team.',
                'status' => 'done',
                'priority' => 'high',
                'due_date' => Carbon::now()->addDays(3)->toDateString(),
            ],
            [
                'tenant_id' => $techNova->id,
                'project_id' => $techProject->id,
                'assigned_to' => $techManager->id,
                'title' => 'Implement push notification module',
                'description' => 'Add and test Firebase notification delivery.',
                'status' => 'todo',
                'priority' => 'low',
                'due_date' => Carbon::now()->addDays(14)->toDateString(),
            ],
        ];

        foreach ($tasks as $taskData) {
            Task::updateOrCreate(
                [
                    'tenant_id' => $taskData['tenant_id'],
                    'project_id' => $taskData['project_id'],
                    'title' => $taskData['title'],
                ],
                $taskData
            );
        }
    }
}
