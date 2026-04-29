<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pixelWeb = Tenant::where('slug', 'pixelweb')->firstOrFail();
        $techNova = Tenant::where('slug', 'technova')->firstOrFail();

        $pixelAdmin = User::where('tenant_id', $pixelWeb->id)->where('role', User::ROLE_ADMIN)->firstOrFail();
        $techAdmin = User::where('tenant_id', $techNova->id)->where('role', User::ROLE_ADMIN)->firstOrFail();

        $projects = [
            [
                'tenant_id' => $pixelWeb->id,
                'name' => 'PixelWeb Website Revamp',
                'description' => 'Redesign company website and improve conversion funnels.',
                'status' => 'active',
                'created_by' => $pixelAdmin->id,
            ],
            [
                'tenant_id' => $pixelWeb->id,
                'name' => 'PixelWeb Internal CRM',
                'description' => 'Build internal CRM dashboard for sales operations.',
                'status' => 'pending',
                'created_by' => $pixelAdmin->id,
            ],
            [
                'tenant_id' => $techNova->id,
                'name' => 'TechNova Mobile App',
                'description' => 'Launch first version of customer mobile application.',
                'status' => 'active',
                'created_by' => $techAdmin->id,
            ],
            [
                'tenant_id' => $techNova->id,
                'name' => 'TechNova Data Migration',
                'description' => 'Migrate legacy customer records to new cloud platform.',
                'status' => 'completed',
                'created_by' => $techAdmin->id,
            ],
        ];

        foreach ($projects as $projectData) {
            Project::updateOrCreate(
                [
                    'tenant_id' => $projectData['tenant_id'],
                    'name' => $projectData['name'],
                ],
                $projectData
            );
        }
    }
}
