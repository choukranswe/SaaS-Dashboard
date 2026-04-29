<?php

namespace Database\Seeders;

use App\Models\Tenant;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tenant::updateOrCreate(
            ['slug' => 'pixelweb'],
            ['name' => 'PixelWeb']
        );

        Tenant::updateOrCreate(
            ['slug' => 'technova'],
            ['name' => 'TechNova']
        );
    }
}
