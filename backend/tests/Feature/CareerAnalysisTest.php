<?php

use App\Models\CoverLetter;
use App\Models\JobDescription;
use App\Models\Resume;
use App\Models\ResumeAnalysis;
use App\Models\User;
use App\Services\OllamaCareerCoach;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(LazilyRefreshDatabase::class);

function analysisResult(): array
{
    return [
        'score' => 78,
        'verdict' => 'Strong foundation',
        'summary' => 'The resume aligns with the core backend requirements.',
        'matched_keywords' => ['Laravel', 'PostgreSQL'],
        'missing_keywords' => ['Kubernetes'],
        'strengths' => ['Relevant API experience'],
        'improvements' => [[
            'priority' => 'high',
            'title' => 'Add deployment evidence',
            'explanation' => 'The role emphasizes production ownership.',
            'suggested_rewrite' => 'Deployed Laravel services through automated delivery pipelines.',
        ]],
        'improved_summary' => 'Backend engineer building reliable Laravel APIs and data systems.',
        'bullet_rewrites' => [],
    ];
}

function parsedResumeFor(User $user): Resume
{
    return Resume::factory()->for($user)->create([
        'status' => 'parsed',
        'parsed_content' => [
            'basics' => ['full_name' => 'Ada Lovelace'],
            'experience' => [],
            'education' => [],
            'skills' => ['Laravel'],
        ],
        'parsed_at' => now(),
    ]);
}

it('creates and persists an ATS analysis for owned career content', function () {
    $user = User::factory()->create();
    $resume = parsedResumeFor($user);
    $job = JobDescription::factory()->for($user)->create();
    $coach = mock(OllamaCareerCoach::class);
    $coach->shouldReceive('analyze')->once()->withArgs(
        fn (Resume $candidateResume, JobDescription $candidateJob): bool => $candidateResume->is($resume) && $candidateJob->is($job),
    )->andReturn(analysisResult());
    app()->instance(OllamaCareerCoach::class, $coach);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/resume-analyses', [
            'resume_id' => $resume->id,
            'job_description_id' => $job->id,
        ])
        ->assertCreated()
        ->assertJsonPath('data.score', 78)
        ->assertJsonPath('data.result.missing_keywords.0', 'Kubernetes')
        ->assertJsonPath('data.resume.name', $resume->original_name)
        ->assertJsonPath('data.job_description.title', $job->title);

    $this->assertDatabaseHas(ResumeAnalysis::class, [
        'user_id' => $user->id,
        'resume_id' => $resume->id,
        'job_description_id' => $job->id,
        'score' => 78,
    ]);
});

it('generates and persists a cover letter for owned career content', function () {
    $user = User::factory()->create();
    $resume = parsedResumeFor($user);
    $job = JobDescription::factory()->for($user)->create();
    $coach = mock(OllamaCareerCoach::class);
    $coach->shouldReceive('coverLetter')->once()->withArgs(
        fn (Resume $candidateResume, JobDescription $candidateJob, string $tone): bool => $candidateResume->is($resume)
            && $candidateJob->is($job)
            && $tone === 'confident',
    )->andReturn('Dear Hiring Team, I am excited to apply.');
    app()->instance(OllamaCareerCoach::class, $coach);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/cover-letters', [
            'resume_id' => $resume->id,
            'job_description_id' => $job->id,
            'tone' => 'confident',
        ])
        ->assertCreated()
        ->assertJsonPath('data.tone', 'confident')
        ->assertJsonPath('data.content', 'Dear Hiring Team, I am excited to apply.');

    $this->assertDatabaseHas(CoverLetter::class, [
        'user_id' => $user->id,
        'tone' => 'confident',
    ]);
});

it('requires a parsed resume', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->for($user)->create(['status' => 'uploaded']);
    $job = JobDescription::factory()->for($user)->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/resume-analyses', [
            'resume_id' => $resume->id,
            'job_description_id' => $job->id,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('resume_id');
});

it('does not analyze another users resume or job description', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $resume = parsedResumeFor($otherUser);
    $job = JobDescription::factory()->for($user)->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/resume-analyses', [
            'resume_id' => $resume->id,
            'job_description_id' => $job->id,
        ])
        ->assertNotFound();
});

it('lists only the authenticated users generated content', function () {
    $user = User::factory()->create();
    $resume = parsedResumeFor($user);
    $job = JobDescription::factory()->for($user)->create();
    ResumeAnalysis::factory()->for($user)->create(['resume_id' => $resume->id, 'job_description_id' => $job->id]);
    CoverLetter::factory()->for($user)->create(['resume_id' => $resume->id, 'job_description_id' => $job->id]);
    ResumeAnalysis::factory()->create();
    CoverLetter::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/resume-analyses')
        ->assertOk()
        ->assertJsonCount(1, 'data');
    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/cover-letters')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('rejects model planning notes instead of persisting them as a cover letter', function () {
    $user = User::factory()->create();
    $resume = parsedResumeFor($user);
    $job = JobDescription::factory()->for($user)->create();
    Http::fake([
        '*' => Http::response([
            'response' => json_encode([
                'content' => 'I need to write a cover letter. Let me analyze the resume and list the key points to include.',
            ], JSON_THROW_ON_ERROR),
        ]),
    ]);

    expect(fn () => app(OllamaCareerCoach::class)->coverLetter($resume, $job, 'warm'))
        ->toThrow(RuntimeException::class, 'Ollama did not return a finished cover letter.');
});
