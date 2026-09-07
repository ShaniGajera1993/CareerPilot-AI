<?php

namespace Database\Factories;

use App\Models\JobDescription;
use App\Models\Resume;
use App\Models\ResumeAnalysis;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResumeAnalysis>
 */
class ResumeAnalysisFactory extends Factory
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
            'score' => fake()->numberBetween(35, 95),
            'result' => [
                'score' => 72,
                'verdict' => 'Good foundation',
                'summary' => 'The resume demonstrates several relevant skills.',
                'matched_keywords' => ['Laravel'],
                'missing_keywords' => ['Kubernetes'],
                'strengths' => ['Relevant backend experience'],
                'improvements' => [],
                'improved_summary' => null,
                'bullet_rewrites' => [],
            ],
        ];
    }
}
