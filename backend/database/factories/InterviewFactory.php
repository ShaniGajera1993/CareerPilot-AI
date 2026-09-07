<?php

namespace Database\Factories;

use App\Models\Interview;
use App\Models\JobDescription;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Interview>
 */
class InterviewFactory extends Factory
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
            'focus' => 'mixed',
            'questions' => [[
                'id' => 'q1',
                'category' => 'behavioral',
                'question' => 'Tell me about a difficult problem you solved.',
                'what_to_cover' => 'Use a concrete situation, action, and result.',
            ]],
        ];
    }
}
