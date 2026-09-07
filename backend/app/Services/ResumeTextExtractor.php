<?php

namespace App\Services;

use App\Models\Resume;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Smalot\PdfParser\Parser;
use Throwable;
use ZipArchive;

class ResumeTextExtractor
{
    public function __construct(private readonly Parser $pdfParser) {}

    public function extract(Resume $resume): string
    {
        $contents = Storage::disk($resume->disk)->get($resume->path);

        if ($contents === '') {
            throw new RuntimeException('The stored resume is empty.');
        }

        $text = match ($resume->extension) {
            'pdf' => $this->extractPdf($contents),
            'docx' => $this->extractDocx($contents),
            default => throw new RuntimeException('This resume format cannot be parsed.'),
        };
        $text = preg_replace('/[\t ]+/u', ' ', $text) ?? $text;
        $text = preg_replace('/(?:\r?\n\s*){3,}/u', "\n\n", $text) ?? $text;
        $text = trim($text);

        if (mb_strlen($text) < 20) {
            throw new RuntimeException('No readable text was found in this resume.');
        }

        return mb_substr($text, 0, 120_000);
    }

    private function extractPdf(string $contents): string
    {
        try {
            return $this->pdfParser->parseContent($contents)->getText();
        } catch (Throwable $exception) {
            throw new RuntimeException('The PDF text could not be extracted.', previous: $exception);
        }
    }

    private function extractDocx(string $contents): string
    {
        if (! class_exists(ZipArchive::class)) {
            throw new RuntimeException('DOCX parsing requires the PHP ZIP extension.');
        }

        $temporaryPath = tempnam(sys_get_temp_dir(), 'careerpilot-docx-');

        if ($temporaryPath === false || file_put_contents($temporaryPath, $contents) === false) {
            throw new RuntimeException('The DOCX file could not be prepared for parsing.');
        }

        $archive = new ZipArchive;
        $isOpen = false;

        try {
            if ($archive->open($temporaryPath) !== true) {
                throw new RuntimeException('The DOCX archive could not be opened.');
            }
            $isOpen = true;

            $documentXml = $archive->getFromName('word/document.xml');

            if (! is_string($documentXml)) {
                throw new RuntimeException('The DOCX document content is missing.');
            }

            $documentXml = str_replace(
                ['</w:p>', '</w:tr>', '<w:tab/>', '<w:br/>', '<w:br />'],
                ["\n", "\n", "\t", "\n", "\n"],
                $documentXml,
            );

            return html_entity_decode(strip_tags($documentXml), ENT_QUOTES | ENT_XML1, 'UTF-8');
        } finally {
            if ($isOpen) {
                $archive->close();
            }
            @unlink($temporaryPath);
        }
    }
}
