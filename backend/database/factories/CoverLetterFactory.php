<?php

namespace Database\Factories;

use App\Models\CoverLetter;
use App\Models\JobDescription;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CoverLetter>
 */
class CoverLetterFactory extends Factory
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
            'resume_id' => Resume::factory(),
            'job_description_id' => JobDescription::factory(),
            'tone' => 'professional',
            'content' => fake()->paragraphs(4, true),
        ];
    }
}
