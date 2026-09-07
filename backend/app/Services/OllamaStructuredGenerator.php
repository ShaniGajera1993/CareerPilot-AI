<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class OllamaStructuredGenerator
{
    /**
     * @param  array<string, mixed>  $schema
     * @return array<string, mixed>
     */
    public function generate(string $system, string $prompt, array $schema): array
    {
        if (function_exists('set_time_limit')) {
            set_time_limit(360);
        }

        $baseUrl = rtrim((string) config('services.ollama.url'), '/');
        $response = Http::acceptJson()
            ->connectTimeout(5)
            ->timeout(330)
            ->retry(2, 500, throw: false)
            ->post("{$baseUrl}/api/generate", [
                'model' => config('services.ollama.model'),
                'stream' => false,
                'think' => false,
                'format' => $schema,
                'options' => ['temperature' => 0],
                'system' => $system,
                'prompt' => $prompt,
            ])
            ->throw()
            ->json();

        $json = $response['response'] ?? null;

        if (! is_string($json) || $json === '') {
            throw new RuntimeException('Ollama did not return structured content.');
        }

        $result = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($result)) {
            throw new RuntimeException('Ollama returned invalid structured content.');
        }

        return $result;
    }
}
