<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ResumeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1/auth')->name('api.v1.auth.')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:6,1')
        ->name('register');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:login')
        ->name('login');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/user', [AuthController::class, 'user'])->name('user');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    });
});

Route::prefix('v1/resumes')
    ->name('api.v1.resumes.')
    ->middleware('auth:sanctum')
    ->group(function (): void {
        Route::get('/', [ResumeController::class, 'index'])->name('index');
        Route::post('/', [ResumeController::class, 'store'])
            ->middleware('throttle:10,1')
            ->name('store');
    });
