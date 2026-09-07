<?php

use App\Models\Resume;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

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

it('parses an owned resume and removes the temporary OpenAI file', function () {
    fakeResumeStorage();
    config()->set('services.openai.key', 'test-key');
    config()->set('services.openai.model', 'gpt-5.4-mini');
    $user = User::factory()->create();
    $resume = Resume::factory()->for($user)->create();
    Storage::disk('local')->put($resume->path, "%PDF-1.4\nresume");

    Http::fake([
        'api.openai.com/v1/files' => Http::response(['id' => 'file_resume_123']),
        'api.openai.com/v1/responses' => Http::response([
            'output' => [[
                'type' => 'message',
                'content' => [[
                    'type' => 'output_text',
                    'text' => json_encode(parsedResumeProfile(), JSON_THROW_ON_ERROR),
                ]],
            ]],
        ]),
        'api.openai.com/v1/files/*' => Http::response(['deleted' => true]),
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
        && $request->url() === 'https://api.openai.com/v1/responses'
        && $request['model'] === 'gpt-5.4-mini'
        && $request['input'][0]['content'][0]['file_id'] === 'file_resume_123'
        && $request['text']['format']['type'] === 'json_schema');
    Http::assertSent(fn (Request $request): bool => $request->method() === 'DELETE'
        && $request->url() === 'https://api.openai.com/v1/files/file_resume_123');
});

it('requires parser configuration without changing resume state', function () {
    config()->set('services.openai.key', null);
    $user = User::factory()->create();
    $resume = Resume::factory()->for($user)->create();

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/resumes/{$resume->id}/parse")
        ->assertServiceUnavailable();

    expect($resume->refresh()->status)->toBe('uploaded');
});

it('marks a resume for retry when parsing fails', function () {
    fakeResumeStorage();
    config()->set('services.openai.key', 'test-key');
    $user = User::factory()->create();
    $resume = Resume::factory()->for($user)->create();
    Storage::disk('local')->put($resume->path, "%PDF-1.4\nresume");

    Http::fake([
        'api.openai.com/v1/files' => Http::response(['id' => 'file_resume_failed']),
        'api.openai.com/v1/responses' => Http::response(['error' => ['message' => 'Unavailable']], 503),
        'api.openai.com/v1/files/*' => Http::response(['deleted' => true]),
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/resumes/{$resume->id}/parse")
        ->assertStatus(502);

    expect($resume->refresh()->status)->toBe('parse_failed');
    Http::assertSent(fn (Request $request): bool => $request->method() === 'DELETE'
        && $request->url() === 'https://api.openai.com/v1/files/file_resume_failed');
});

it('does not parse another users resume', function () {
    config()->set('services.openai.key', 'test-key');
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
