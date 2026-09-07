<?php

use App\Models\Application;
use App\Models\Interview;
use App\Models\JobDescription;
use App\Models\Resume;
use App\Models\ResumeAnalysis;
use App\Models\User;
use App\Services\OllamaCareerCoach;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

function phaseFourResume(User $user): Resume
{
    return Resume::factory()->for($user)->create([
        'status' => 'parsed',
        'parsed_content' => ['basics' => ['full_name' => 'Ada Lovelace'], 'skills' => ['Laravel']],
        'parsed_at' => now(),
    ]);
}

function phaseFourQuestions(): array
{
    return collect(range(1, 7))->map(fn (int $number) => [
        'id' => "q{$number}",
        'category' => $number < 4 ? 'technical' : 'behavioral',
        'question' => "Practice question {$number}?",
        'what_to_cover' => 'Give a specific and truthful example.',
    ])->all();
}

it('creates lists and updates an owned application', function () {
    $user = User::factory()->create();

    $created = $this->actingAs($user, 'sanctum')->postJson('/api/v1/applications', [
        'role' => 'Backend Engineer',
        'company' => 'Northstar',
        'status' => 'applied',
        'applied_at' => '2026-09-01',
        'notes' => 'Follow up next week.',
    ])->assertCreated()->assertJsonPath('data.status', 'applied')->json('data');

    $this->actingAs($user, 'sanctum')->putJson("/api/v1/applications/{$created['id']}", [
        'status' => 'interview',
        'interview_at' => '2026-09-12 10:30:00',
    ])->assertOk()->assertJsonPath('data.status', 'interview');

    $this->actingAs($user, 'sanctum')->getJson('/api/v1/applications?status=interview')
        ->assertOk()->assertJsonCount(1, 'data');
});

it('deletes only an owned application', function () {
    $user = User::factory()->create();
    $application = Application::factory()->for($user)->create();
    $otherApplication = Application::factory()->create();

    $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/applications/{$otherApplication->id}")->assertNotFound();
    $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/applications/{$application->id}")->assertNoContent();
});

it('rejects a job description owned by someone else when tracking it', function () {
    $user = User::factory()->create();
    $job = JobDescription::factory()->create();

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/applications', [
        'job_description_id' => $job->id,
        'role' => 'Engineer',
        'company' => 'Example',
        'status' => 'wishlist',
    ])->assertNotFound();
});

it('generates and persists a local interview practice set', function () {
    $user = User::factory()->create();
    $resume = phaseFourResume($user);
    $job = JobDescription::factory()->for($user)->create();
    $coach = mock(OllamaCareerCoach::class);
    $coach->shouldReceive('interviewQuestions')->once()->andReturn(phaseFourQuestions());
    app()->instance(OllamaCareerCoach::class, $coach);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/interviews', [
        'resume_id' => $resume->id,
        'job_description_id' => $job->id,
        'focus' => 'mixed',
    ])->assertCreated()->assertJsonCount(7, 'data.questions');

    $this->assertDatabaseHas(Interview::class, ['user_id' => $user->id, 'focus' => 'mixed']);
});

it('evaluates mock interview answers and saves the score', function () {
    $user = User::factory()->create();
    $resume = phaseFourResume($user);
    $job = JobDescription::factory()->for($user)->create();
    $interview = Interview::factory()->for($user)->create([
        'resume_id' => $resume->id,
        'job_description_id' => $job->id,
        'questions' => phaseFourQuestions(),
    ]);
    $feedback = [
        'overall_score' => 84,
        'summary' => 'Clear and relevant answers.',
        'strengths' => ['Specific examples'],
        'improvements' => ['State outcomes sooner'],
        'question_feedback' => [],
    ];
    $coach = mock(OllamaCareerCoach::class);
    $coach->shouldReceive('evaluateInterview')->once()->andReturn($feedback);
    app()->instance(OllamaCareerCoach::class, $coach);

    $this->actingAs($user, 'sanctum')->postJson("/api/v1/interviews/{$interview->id}/evaluate", [
        'answers' => [['question_id' => 'q1', 'answer' => 'I used a queue to move slow work outside the request lifecycle.']],
    ])->assertOk()->assertJsonPath('data.overall_score', 84);

    $this->assertDatabaseHas(Interview::class, ['id' => $interview->id, 'overall_score' => 84]);
});

it('does not evaluate another users interview', function () {
    $user = User::factory()->create();
    $interview = Interview::factory()->create();

    $this->actingAs($user, 'sanctum')->postJson("/api/v1/interviews/{$interview->id}/evaluate", [
        'answers' => [['question_id' => 'q1', 'answer' => 'This answer contains enough detail for request validation.']],
    ])->assertNotFound();
});

it('returns application, ATS, interview, and skill analytics for the user', function () {
    $user = User::factory()->create();
    Application::factory()->count(2)->for($user)->create(['status' => 'applied']);
    Application::factory()->for($user)->create(['status' => 'interview']);
    $resume = phaseFourResume($user);
    $job = JobDescription::factory()->for($user)->create();
    ResumeAnalysis::factory()->for($user)->create([
        'resume_id' => $resume->id,
        'job_description_id' => $job->id,
        'score' => 76,
        'result' => ['matched_keywords' => ['Laravel'], 'missing_keywords' => ['Redis']],
    ]);
    Interview::factory()->for($user)->create([
        'resume_id' => $resume->id,
        'job_description_id' => $job->id,
        'overall_score' => 88,
        'completed_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->getJson('/api/v1/analytics')
        ->assertOk()
        ->assertJsonPath('data.applications.total', 3)
        ->assertJsonPath('data.applications.by_status.applied', 2)
        ->assertJsonPath('data.ats.average', 76)
        ->assertJsonPath('data.interviews.average_score', 88)
        ->assertJsonPath('data.skills.missing.Redis', 1);
});
