<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResumeAnalysisResource extends JsonResource
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
            'resume' => [
                'id' => $this->resume_id,
                'name' => $this->resume->original_name,
            ],
            'job_description' => [
                'id' => $this->job_description_id,
                'title' => $this->jobDescription->title,
                'company' => $this->jobDescription->company,
            ],
            'score' => $this->score,
            'result' => $this->result,
            'created_at' => $this->created_at,
        ];
    }
}
