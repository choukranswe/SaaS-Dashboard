<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pixelWeb = Tenant::where('slug', 'pixelweb')->firstOrFail();
        $techNova = Tenant::where('slug', 'technova')->firstOrFail();

        $users = [
            [
                'tenant_id' => $pixelWeb->id,
                'name' => 'PixelWeb Admin',
                'email' => 'admin@pixelweb.com',
                'role' => User::ROLE_ADMIN,
            ],
            [
                'tenant_id' => $pixelWeb->id,
                'name' => 'PixelWeb Manager',
                'email' => 'manager@pixelweb.com',
                'role' => User::ROLE_MANAGER,
            ],
            [
                'tenant_id' => $pixelWeb->id,
                'name' => 'PixelWeb Viewer',
                'email' => 'viewer@pixelweb.com',
                'role' => User::ROLE_VIEWER,
            ],
            [
                'tenant_id' => $techNova->id,
                'name' => 'TechNova Admin',
                'email' => 'admin@technova.com',
                'role' => User::ROLE_ADMIN,
            ],
            [
                'tenant_id' => $techNova->id,
                'name' => 'TechNova Manager',
                'email' => 'manager@technova.com',
                'role' => User::ROLE_MANAGER,
            ],
            [
                'tenant_id' => $techNova->id,
                'name' => 'TechNova Viewer',
                'email' => 'viewer@technova.com',
                'role' => User::ROLE_VIEWER,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'tenant_id' => $userData['tenant_id'],
                    'name' => $userData['name'],
                    'role' => $userData['role'],
                    'password' => Hash::make('password'),
                ]
            );
        }
    }
}
