<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserCsvImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_import_users_into_their_own_tenant(): void
    {
        $tenant = Tenant::create(['name' => 'PixelWeb', 'slug' => 'pixelweb']);
        $otherTenant = Tenant::create(['name' => 'TechNova', 'slug' => 'technova']);
        $admin = $this->createUser($tenant, User::ROLE_ADMIN, 'admin@example.com');

        Sanctum::actingAs($admin);

        $csv = implode("\n", [
            'name,email,role,password,tenant_id',
            'Imported Manager,manager-import@example.com,manager,password123,'.$otherTenant->id,
            'Imported Viewer,viewer-import@example.com,viewer,,'.$otherTenant->id,
        ]);

        $response = $this->post('/api/users/import-csv', [
            'file' => UploadedFile::fake()->createWithContent('users.csv', $csv),
        ], ['Accept' => 'application/json']);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'CSV import completed')
            ->assertJsonPath('imported_count', 2)
            ->assertJsonPath('failed_count', 0);

        $manager = User::where('email', 'manager-import@example.com')->firstOrFail();
        $viewer = User::where('email', 'viewer-import@example.com')->firstOrFail();

        $this->assertSame($tenant->id, $manager->tenant_id);
        $this->assertSame($tenant->id, $viewer->tenant_id);
        $this->assertTrue(Hash::check('password123', $manager->password));
        $this->assertTrue(Hash::check('password', $viewer->password));

        $this->assertDatabaseMissing('users', [
            'email' => 'manager-import@example.com',
            'tenant_id' => $otherTenant->id,
        ]);
    }

    public function test_manager_cannot_import_users(): void
    {
        $tenant = Tenant::create(['name' => 'PixelWeb', 'slug' => 'pixelweb']);
        $manager = $this->createUser($tenant, User::ROLE_MANAGER, 'manager@example.com');

        Sanctum::actingAs($manager);

        $csv = implode("\n", [
            'name,email,role,password',
            'Imported Viewer,blocked@example.com,viewer,password123',
        ]);

        $response = $this->post('/api/users/import-csv', [
            'file' => UploadedFile::fake()->createWithContent('users.csv', $csv),
        ], ['Accept' => 'application/json']);

        $response->assertForbidden();

        $this->assertDatabaseMissing('users', [
            'email' => 'blocked@example.com',
        ]);
    }

    public function test_import_returns_row_errors_and_keeps_valid_rows(): void
    {
        $tenant = Tenant::create(['name' => 'PixelWeb', 'slug' => 'pixelweb']);
        $admin = $this->createUser($tenant, User::ROLE_ADMIN, 'admin@example.com');
        $this->createUser($tenant, User::ROLE_VIEWER, 'existing@example.com');

        Sanctum::actingAs($admin);

        $csv = implode("\n", [
            'name,email,role,password',
            'Bad Email,not-an-email,viewer,password123',
            'Bad Role,bad-role@example.com,owner,password123',
            'Existing Email,existing@example.com,viewer,password123',
            'Short Password,short-password@example.com,viewer,short',
            'Valid Viewer,valid-viewer@example.com,viewer,',
        ]);

        $response = $this->post('/api/users/import-csv', [
            'file' => UploadedFile::fake()->createWithContent('users.csv', $csv),
        ], ['Accept' => 'application/json']);

        $response
            ->assertOk()
            ->assertJsonPath('imported_count', 1)
            ->assertJsonPath('failed_count', 4)
            ->assertJsonCount(4, 'errors');

        $this->assertDatabaseHas('users', [
            'tenant_id' => $tenant->id,
            'email' => 'valid-viewer@example.com',
            'role' => User::ROLE_VIEWER,
        ]);
    }

    private function createUser(Tenant $tenant, string $role, string $email): User
    {
        return User::create([
            'tenant_id' => $tenant->id,
            'name' => ucfirst($role).' User',
            'email' => $email,
            'role' => $role,
            'password' => Hash::make('password'),
        ]);
    }
}
