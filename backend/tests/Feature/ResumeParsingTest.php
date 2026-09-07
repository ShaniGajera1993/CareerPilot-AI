<?php

use App\Models\Resume;
use App\Models\User;
use App\Services\ResumeTextExtractor;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

uses(LazilyRefreshDatabase::class);

function parsedResumeProfile(): array
{
    return [
        'basics' => [
            'full_name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'phone' => null,
            'location' => 'London',
            'headline' => 'Computing pioneer',
            'summary' => 'Mathematician and writer.',
        ],
        'experience' => [[
            'company' => 'Analytical Engines Ltd',
            'role' => 'Mathematician',
            'location' => 'London',
            'start_date' => '1842',
            'end_date' => '1843',
            'current' => false,
            'bullets' => ['Published the first algorithm intended for a machine.'],
        ]],
        'education' => [],
        'skills' => ['Mathematics', 'Technical writing'],
    ];
}

it('parses an owned resume with the local Ollama service', function () {
    config()->set('services.ollama.url', 'http://127.0.0.1:11434');
    config()->set('services.ollama.model', 'qwen3:4b');
    $user = User::factory()->create();
    $resume = Resume::factory()->for($user)->create();
    $extractor = mock(ResumeTextExtractor::class);
    $extractor->shouldReceive('extract')
        ->once()
        ->withArgs(fn (Resume $candidate): bool => $candidate->is($resume))
        ->andReturn('Ada Lovelace is a mathematician and technical writer in London.');
    app()->instance(ResumeTextExtractor::class, $extractor);

    Http::fake([
        '127.0.0.1:11434/api/generate' => Http::response([
            'model' => 'qwen3:4b',
            'done' => true,
            'response' => json_encode(parsedResumeProfile(), JSON_THROW_ON_ERROR),
        ]),
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/resumes/{$resume->id}/parse")
        ->assertSuccessful()
        ->assertJsonPath('data.status', 'parsed')
        ->assertJsonPath('data.parsed_content.basics.full_name', 'Ada Lovelace')
        ->assertJsonPath('data.parsed_content.skills.0', 'Mathematics');

    expect($resume->refresh())
        ->status->toBe('parsed')
        ->parsed_at->not->toBeNull();

    Http::assertSent(fn (Request $request): bool => $request->method() === 'POST'
        && $request->url() === 'http://127.0.0.1:11434/api/generate'
        && $request['model'] === 'qwen3:4b'
        && $request['stream'] === false
        && $request['think'] === false
        && $request['options']['temperature'] === 0
        && $request['format']['type'] === 'object'
        && str_contains($request['prompt'], 'Ada Lovelace'));
});

it('marks a resume for retry when Ollama is unavailable', function () {
    config()->set('services.ollama.url', 'http://127.0.0.1:11434');
    $user = User::factory()->create();
    $resume = Resume::factory()->for($user)->create();
    $extractor = mock(ResumeTextExtractor::class);
    $extractor->shouldReceive('extract')->once()->andReturn('A readable resume with enough text for parsing.');
    app()->instance(ResumeTextExtractor::class, $extractor);

    Http::fake([
        '127.0.0.1:11434/api/generate' => Http::response(['error' => 'Unavailable'], 503),
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/resumes/{$resume->id}/parse")
        ->assertStatus(502);

    expect($resume->refresh()->status)->toBe('parse_failed');
});

it('does not parse another users resume', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/resumes/{$resume->id}/parse")
        ->assertNotFound();

    Http::assertNothingSent();
});

it('updates the structured content of an owned parsed resume', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->for($user)->create([
        'status' => 'parsed',
        'parsed_content' => parsedResumeProfile(),
        'parsed_at' => now(),
    ]);
    $profile = parsedResumeProfile();
    $profile['basics']['headline'] = 'Senior computing pioneer';

    $this->actingAs($user, 'sanctum')
        ->putJson("/api/v1/resumes/{$resume->id}", $profile)
        ->assertSuccessful()
        ->assertJsonPath('data.parsed_content.basics.headline', 'Senior computing pioneer');

    expect($resume->refresh()->parsed_content['basics']['headline'])
        ->toBe('Senior computing pioneer');
});

it('validates resume editor data and protects ownership', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->putJson("/api/v1/resumes/{$resume->id}", parsedResumeProfile())
        ->assertNotFound();

    $ownedResume = Resume::factory()->for($user)->create();
    $this->actingAs($user, 'sanctum')
        ->putJson("/api/v1/resumes/{$ownedResume->id}", [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['basics', 'experience', 'education', 'skills']);
});
