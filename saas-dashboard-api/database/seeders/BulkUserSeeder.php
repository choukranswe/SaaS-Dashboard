<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BulkUserSeeder extends Seeder
{
    /**
     * Generate 1,000 tenant users: 950 viewers and 50 managers.
     */
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'pixelweb'],
            ['name' => 'PixelWeb']
        );

        $this->seedUsers($tenant, User::ROLE_MANAGER, 50, 'Generated Manager', 'manager');
        $this->seedUsers($tenant, User::ROLE_VIEWER, 950, 'Generated Viewer', 'viewer');
    }

    private function seedUsers(Tenant $tenant, string $role, int $count, string $namePrefix, string $emailPrefix): void
    {
        $password = Hash::make('password');

        User::factory()
            ->count($count)
            ->forTenant($tenant)
            ->role($role)
            ->sequence(fn (Sequence $sequence) => [
                'name' => sprintf('%s %03d', $namePrefix, $sequence->index + 1),
                'email' => sprintf('seed.%s.%03d@%s.test', $emailPrefix, $sequence->index + 1, $tenant->slug),
                'password' => $password,
            ])
            ->make()
            ->each(function (User $user): void {
                User::updateOrCreate(
                    ['email' => $user->email],
                    [
                        'tenant_id' => $user->tenant_id,
                        'name' => $user->name,
                        'role' => $user->role,
                        'password' => $user->password,
                        'email_verified_at' => $user->email_verified_at,
                        'remember_token' => $user->remember_token,
                    ]
                );
            });
    }
}
