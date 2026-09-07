<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'role' => fake()->jobTitle(),
            'company' => fake()->company(),
            'location' => fake()->city(),
            'status' => fake()->randomElement(['wishlist', 'applied', 'interview', 'offer', 'rejected']),
            'applied_at' => fake()->optional()->dateTimeBetween('-3 months'),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
