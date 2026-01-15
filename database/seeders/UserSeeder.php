<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database with the admin user.
     */
    public function run(): void
    {
        // Create the single admin user
        User::updateOrCreate(
            ['email' => 'me@aryagading.com'],
            [
                'name' => 'Arya Gading Prinandika',
                'email' => 'me@aryagading.com',
                'password' => Hash::make('password'), // Change this password after first login!
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Admin user created: me@aryagading.com');
        $this->command->warn('Remember to change the default password after first login!');
    }
}
