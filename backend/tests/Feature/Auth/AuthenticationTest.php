<?php

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

uses(LazilyRefreshDatabase::class);

it('registers a user and returns an access token', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => '  Ada   Lovelace  ',
        'email' => 'ADA@EXAMPLE.COM',
        'password' => 'secret123',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('user.name', 'Ada Lovelace')
        ->assertJsonPath('user.email', 'ada@example.com')
        ->assertJsonStructure(['user' => ['id', 'name', 'email', 'created_at'], 'token']);

    $user = User::query()->where('email', 'ada@example.com')->firstOrFail();

    expect(Hash::check('secret123', $user->password))->toBeTrue()
        ->and($user->tokens)->toHaveCount(1);
});

it('rejects invalid registration data', function (array $data, string $field) {
    $this->postJson('/api/v1/auth/register', $data)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'missing name' => [['email' => 'ada@example.com', 'password' => 'secret123'], 'name'],
    'invalid email' => [['name' => 'Ada', 'email' => 'invalid', 'password' => 'secret123'], 'email'],
    'short password' => [['name' => 'Ada', 'email' => 'ada@example.com', 'password' => 'short'], 'password'],
]);

it('does not register a duplicate email address', function () {
    User::factory()->create(['email' => 'ada@example.com']);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Ada Lovelace',
        'email' => 'ADA@example.com',
        'password' => 'secret123',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');
});

it('logs in an existing user and returns an access token', function () {
    $user = User::factory()->create([
        'email' => 'ada@example.com',
        'password' => 'secret123',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => ' ADA@EXAMPLE.COM ',
        'password' => 'secret123',
    ]);

    $response
        ->assertSuccessful()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonStructure(['user', 'token']);

    expect($user->fresh()->tokens)->toHaveCount(1);
});

it('rejects incorrect login credentials', function () {
    User::factory()->create([
        'email' => 'ada@example.com',
        'password' => 'secret123',
    ]);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'ada@example.com',
        'password' => 'incorrect',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');
});

it('rate limits repeated login attempts', function () {
    User::factory()->create([
        'email' => 'ada@example.com',
        'password' => 'secret123',
    ]);

    foreach (range(1, 5) as $attempt) {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'ada@example.com',
            'password' => 'incorrect',
        ])->assertUnprocessable();
    }

    $this->postJson('/api/v1/auth/login', [
        'email' => 'ada@example.com',
        'password' => 'incorrect',
    ])->assertTooManyRequests();
});

it('returns the authenticated user', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/v1/auth/user')
        ->assertSuccessful()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email);
});

it('logs out by revoking the current access token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/v1/auth/logout')
        ->assertNoContent();

    expect($user->tokens()->count())->toBe(0);

    Auth::forgetGuards();

    $this->withToken($token)
        ->getJson('/api/v1/auth/user')
        ->assertUnauthorized();
});

it('protects user and logout endpoints from guests', function (string $method, string $uri) {
    $response = $method === 'get'
        ? $this->getJson($uri)
        : $this->postJson($uri);

    $response->assertUnauthorized();
})->with([
    'current user' => ['get', '/api/v1/auth/user'],
    'logout' => ['post', '/api/v1/auth/logout'],
]);
