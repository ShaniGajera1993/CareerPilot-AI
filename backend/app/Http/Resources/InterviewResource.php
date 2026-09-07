<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterviewResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'resume' => ['id' => $this->resume_id, 'name' => $this->resume->original_name],
            'job_description' => ['id' => $this->job_description_id, 'title' => $this->jobDescription->title, 'company' => $this->jobDescription->company],
            'focus' => $this->focus,
            'questions' => $this->questions,
            'answers' => $this->answers,
            'overall_score' => $this->overall_score,
            'feedback' => $this->feedback,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
        ];
    }
}
