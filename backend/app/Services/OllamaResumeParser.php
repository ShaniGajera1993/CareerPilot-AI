<?php

namespace App\Services;

use App\Models\Resume;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class OllamaResumeParser
{
    public function __construct(private readonly ResumeTextExtractor $textExtractor) {}

    /**
     * @return array<string, mixed>
     */
    public function parse(Resume $resume): array
    {
        if (function_exists('set_time_limit')) {
            set_time_limit(240);
        }

        $schema = $this->schema();
        $resumeText = $this->textExtractor->extract($resume);
        $baseUrl = rtrim((string) config('services.ollama.url'), '/');

        $response = Http::acceptJson()
            ->connectTimeout(5)
            ->timeout(210)
            ->retry(2, 500, throw: false)
            ->post("{$baseUrl}/api/generate", [
                'model' => config('services.ollama.model'),
                'stream' => false,
                'think' => false,
                'format' => $schema,
                'options' => [
                    'temperature' => 0,
                ],
                'system' => 'You extract factual resume data. Never invent details. Preserve original wording where practical. Use null for missing scalar values and empty arrays for missing collections.',
                'prompt' => 'Return only JSON matching this schema: '.json_encode($schema, JSON_THROW_ON_ERROR)."\n\nResume text:\n{$resumeText}",
            ])
            ->throw()
            ->json();

        $json = $response['response'] ?? null;

        if (! is_string($json) || $json === '') {
            throw new RuntimeException('Ollama did not return parsed resume content.');
        }

        $parsed = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($parsed)) {
            throw new RuntimeException('Ollama returned an invalid resume profile.');
        }

        return $parsed;
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
