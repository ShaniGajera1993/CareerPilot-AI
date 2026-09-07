<?php

use App\Models\JobDescription;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

it('stores a job description for the authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/job-descriptions', [
            'title' => 'Backend Engineer',
            'company' => 'Acme',
            'description' => str_repeat('Build resilient Laravel services. ', 3),
        ])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Backend Engineer')
        ->assertJsonPath('data.company', 'Acme');

    expect(JobDescription::query()->firstOrFail()->user_id)->toBe($user->id);
});

it('lists only the current users job descriptions newest first', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    JobDescription::factory()->for($user)->create([
        'title' => 'Older role',
        'created_at' => now()->subDay(),
    ]);
    JobDescription::factory()->for($user)->create([
        'title' => 'Newer role',
        'created_at' => now(),
    ]);
    JobDescription::factory()->for($otherUser)->create(['title' => 'Private role']);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/job-descriptions')
        ->assertSuccessful()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('data.0.title', 'Newer role')
        ->assertJsonMissing(['Private role']);
});

it('validates job description input', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/job-descriptions', [
            'title' => '',
            'description' => 'Too short',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title', 'description']);
});

it('requires authentication for job descriptions', function () {
    $this->getJson('/api/v1/job-descriptions')->assertUnauthorized();
    $this->postJson('/api/v1/job-descriptions', [])->assertUnauthorized();
});
