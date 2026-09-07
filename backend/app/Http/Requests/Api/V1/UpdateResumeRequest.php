<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateResumeRequest extends FormRequest
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
            'basics' => ['required', 'array'],
            'basics.full_name' => ['nullable', 'string', 'max:160'],
            'basics.email' => ['nullable', 'email', 'max:255'],
            'basics.phone' => ['nullable', 'string', 'max:80'],
            'basics.location' => ['nullable', 'string', 'max:160'],
            'basics.headline' => ['nullable', 'string', 'max:255'],
            'basics.summary' => ['nullable', 'string', 'max:5000'],
            'experience' => ['present', 'array', 'max:50'],
            'experience.*.company' => ['required', 'string', 'max:160'],
            'experience.*.role' => ['required', 'string', 'max:160'],
            'experience.*.location' => ['nullable', 'string', 'max:160'],
            'experience.*.start_date' => ['nullable', 'string', 'max:40'],
            'experience.*.end_date' => ['nullable', 'string', 'max:40'],
            'experience.*.current' => ['required', 'boolean'],
            'experience.*.bullets' => ['required', 'array', 'max:30'],
            'experience.*.bullets.*' => ['required', 'string', 'max:1000'],
            'education' => ['present', 'array', 'max:30'],
            'education.*.institution' => ['required', 'string', 'max:200'],
            'education.*.degree' => ['nullable', 'string', 'max:160'],
            'education.*.field' => ['nullable', 'string', 'max:160'],
            'education.*.start_date' => ['nullable', 'string', 'max:40'],
            'education.*.end_date' => ['nullable', 'string', 'max:40'],
            'skills' => ['present', 'array', 'max:200'],
            'skills.*' => ['required', 'string', 'max:100'],
        ];
    }
}
