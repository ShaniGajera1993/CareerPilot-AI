<?php

namespace App\Models;

use Database\Factories\JobDescriptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'company', 'description'])]
class JobDescription extends Model
{
    /** @use HasFactory<JobDescriptionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<ResumeAnalysis, $this> */
    public function analyses(): HasMany
    {
        return $this->hasMany(ResumeAnalysis::class);
    }

    /** @return HasMany<CoverLetter, $this> */
    public function coverLetters(): HasMany
    {
        return $this->hasMany(CoverLetter::class);
    }
}
