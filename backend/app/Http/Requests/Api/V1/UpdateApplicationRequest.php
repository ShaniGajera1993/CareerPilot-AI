<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicationRequest extends FormRequest
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
            'role' => ['sometimes', 'required', 'string', 'max:160'],
            'company' => ['sometimes', 'required', 'string', 'max:160'],
            'location' => ['sometimes', 'nullable', 'string', 'max:160'],
            'status' => ['sometimes', 'required', 'in:wishlist,applied,interview,offer,rejected'],
            'applied_at' => ['sometimes', 'nullable', 'date'],
            'interview_at' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ];
    }
}
