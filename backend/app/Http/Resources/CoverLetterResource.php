<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CoverLetterResource extends JsonResource
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
            'tone' => $this->tone,
            'content' => $this->content,
            'created_at' => $this->created_at,
        ];
    }
}
