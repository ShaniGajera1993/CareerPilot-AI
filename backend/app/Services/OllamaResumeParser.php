<?php

namespace App\Services;

use App\Models\Resume;

class OllamaResumeParser
{
    public function __construct(
        private readonly ResumeTextExtractor $textExtractor,
        private readonly OllamaStructuredGenerator $generator,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function parse(Resume $resume): array
    {
        $schema = $this->schema();
        $resumeText = $this->textExtractor->extract($resume);

        return $this->generator->generate(
            'You extract factual resume data. Never invent details. Preserve original wording where practical. Use null for missing scalar values and empty arrays for missing collections.',
            'Return only JSON matching this schema: '.json_encode($schema, JSON_THROW_ON_ERROR)."\n\nResume text:\n{$resumeText}",
            $schema,
        );
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
