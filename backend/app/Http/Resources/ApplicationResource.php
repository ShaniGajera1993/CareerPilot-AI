<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
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
            'job_description_id' => $this->job_description_id,
            'role' => $this->role,
            'company' => $this->company,
            'location' => $this->location,
            'status' => $this->status,
            'applied_at' => $this->applied_at?->toDateString(),
            'interview_at' => $this->interview_at,
            'notes' => $this->notes,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
