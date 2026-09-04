<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use ZipArchive;

class StoreResumeRequest extends FormRequest
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
            'resume' => ['required', 'file', 'max:10240'],
        ];
    }

    /**
     * Validate the file signature instead of trusting its name or browser MIME type.
     *
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $file = $this->file('resume');

                if ($validator->errors()->has('resume') || ! $file || ! $file->isValid()) {
                    return;
                }

                $originalName = basename(str_replace('\\', '/', $file->getClientOriginalName()));

                if ($originalName === '' || mb_strlen($originalName) > 255) {
                    $validator->errors()->add(
                        'resume',
                        'Choose a file with a name shorter than 256 characters.',
                    );

                    return;
                }

                $extension = strtolower($file->getClientOriginalExtension());
                $isSupported = match ($extension) {
                    'pdf' => $this->isPdf($file->getPathname()),
                    'docx' => $this->isDocx($file->getPathname()),
                    default => false,
                };

                if (! $isSupported) {
                    $validator->errors()->add(
                        'resume',
                        'Choose a valid PDF or DOCX resume.',
                    );
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'resume.required' => 'Choose a resume to upload.',
            'resume.max' => 'Resume files must be 10 MB or smaller.',
        ];
    }

    private function isPdf(string $path): bool
    {
        $handle = fopen($path, 'rb');

        if ($handle === false) {
            return false;
        }

        $signature = fread($handle, 5);
        fclose($handle);

        return $signature === '%PDF-';
    }

    private function isDocx(string $path): bool
    {
        $archive = new ZipArchive;

        if ($archive->open($path) !== true) {
            return false;
        }

        $isDocument = $archive->locateName('[Content_Types].xml') !== false
            && $archive->locateName('word/document.xml') !== false;

        $archive->close();

        return $isDocument;
    }
}
