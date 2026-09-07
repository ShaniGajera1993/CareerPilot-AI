<?php

namespace App\Services;

use App\Models\Resume;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class OpenAIResumeParser
{
    /**
     * @return array<string, mixed>
     */
    public function parse(Resume $resume): array
    {
        $apiKey = config('services.openai.key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('OpenAI resume parsing is not configured.');
        }

        $contents = Storage::disk($resume->disk)->get($resume->path);

        if ($contents === '') {
            throw new RuntimeException('The stored resume could not be read.');
        }

        $fileId = null;

        try {
            $upload = $this->client($apiKey)
                ->attach('file', $contents, $resume->original_name)
                ->post('https://api.openai.com/v1/files', ['purpose' => 'user_data'])
                ->throw()
                ->json();
            $fileId = $upload['id'] ?? null;

            if (! is_string($fileId) || $fileId === '') {
                throw new RuntimeException('OpenAI did not return a file identifier.');
            }

            $response = $this->client($apiKey)
                ->post('https://api.openai.com/v1/responses', [
                    'model' => config('services.openai.model'),
                    'store' => false,
                    'instructions' => 'Extract only facts stated in the resume. Preserve the original wording where practical. Use null for missing scalar values and empty arrays for missing collections.',
                    'input' => [[
                        'role' => 'user',
                        'content' => [
                            ['type' => 'input_file', 'file_id' => $fileId],
                            ['type' => 'input_text', 'text' => 'Parse this resume into the requested profile structure.'],
                        ],
                    ]],
                    'text' => [
                        'format' => [
                            'type' => 'json_schema',
                            'name' => 'resume_profile',
                            'strict' => true,
                            'schema' => $this->schema(),
                        ],
                    ],
                ])
                ->throw()
                ->json();

            $json = $this->outputText($response);
            $parsed = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

            if (! is_array($parsed)) {
                throw new RuntimeException('OpenAI returned an invalid resume profile.');
            }

            return $parsed;
        } finally {
            if (is_string($fileId) && $fileId !== '') {
                $this->client($apiKey)
                    ->delete("https://api.openai.com/v1/files/{$fileId}");
            }
        }
    }

    private function client(string $apiKey): PendingRequest
    {
        return Http::withToken($apiKey)
            ->acceptJson()
            ->timeout(120)
            ->retry(2, 300, throw: false);
    }

    /**
     * @param  array<string, mixed>  $response
     */
    private function outputText(array $response): string
    {
        foreach ($response['output'] ?? [] as $item) {
            foreach ($item['content'] ?? [] as $content) {
                if (($content['type'] ?? null) === 'output_text' && is_string($content['text'] ?? null)) {
                    return $content['text'];
                }
            }
        }

        throw new RuntimeException('OpenAI did not return parsed resume content.');
    }

    /**
     * @return array<string, mixed>
     */
    private function schema(): array
    {
        $nullableString = ['type' => ['string', 'null']];

        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => ['basics', 'experience', 'education', 'skills'],
            'properties' => [
                'basics' => [
                    'type' => 'object',
                    'additionalProperties' => false,
                    'required' => ['full_name', 'email', 'phone', 'location', 'headline', 'summary'],
                    'properties' => [
                        'full_name' => $nullableString,
                        'email' => $nullableString,
                        'phone' => $nullableString,
                        'location' => $nullableString,
                        'headline' => $nullableString,
                        'summary' => $nullableString,
                    ],
                ],
                'experience' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'required' => ['company', 'role', 'location', 'start_date', 'end_date', 'current', 'bullets'],
                        'properties' => [
                            'company' => ['type' => 'string'],
                            'role' => ['type' => 'string'],
                            'location' => $nullableString,
                            'start_date' => $nullableString,
                            'end_date' => $nullableString,
                            'current' => ['type' => 'boolean'],
                            'bullets' => ['type' => 'array', 'items' => ['type' => 'string']],
                        ],
                    ],
                ],
                'education' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'required' => ['institution', 'degree', 'field', 'start_date', 'end_date'],
                        'properties' => [
                            'institution' => ['type' => 'string'],
                            'degree' => $nullableString,
                            'field' => $nullableString,
                            'start_date' => $nullableString,
                            'end_date' => $nullableString,
                        ],
                    ],
                ],
                'skills' => ['type' => 'array', 'items' => ['type' => 'string']],
            ],
        ];
    }
}
