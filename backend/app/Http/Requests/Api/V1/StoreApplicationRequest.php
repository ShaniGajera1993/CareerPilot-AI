<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_description_id' => ['nullable', 'integer'],
            'role' => ['required', 'string', 'max:160'],
            'company' => ['required', 'string', 'max:160'],
            'location' => ['nullable', 'string', 'max:160'],
            'status' => ['required', 'in:wishlist,applied,interview,offer,rejected'],
            'applied_at' => ['nullable', 'date'],
            'interview_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
