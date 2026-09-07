<?php

namespace App\Models;

use Database\Factories\ResumeAnalysisFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['resume_id', 'job_description_id', 'score', 'result'])]
class ResumeAnalysis extends Model
{
    /** @use HasFactory<ResumeAnalysisFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Resume, $this> */
    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    /** @return BelongsTo<JobDescription, $this> */
    public function jobDescription(): BelongsTo
    {
        return $this->belongsTo(JobDescription::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['score' => 'integer', 'result' => 'array'];
    }
}
