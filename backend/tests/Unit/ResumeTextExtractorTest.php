<?php

use App\Models\Resume;
use App\Services\ResumeTextExtractor;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Document;
use Smalot\PdfParser\Parser;
use Tests\TestCase;

uses(TestCase::class);

it('extracts and normalizes text from a PDF resume', function () {
    $resume = new Resume([
        'disk' => 'local',
        'path' => 'resumes/1/resume.pdf',
        'extension' => 'pdf',
    ]);
    $disk = mock(Filesystem::class);
    $disk->shouldReceive('get')->once()->with($resume->path)->andReturn('%PDF contents');
    Storage::shouldReceive('disk')->once()->with('local')->andReturn($disk);

    $document = mock(Document::class);
    $document->shouldReceive('getText')->once()->andReturn("Ada   Lovelace\n\n\nMathematician and writer");
    $parser = mock(Parser::class);
    $parser->shouldReceive('parseContent')->once()->with('%PDF contents')->andReturn($document);

    $text = (new ResumeTextExtractor($parser))->extract($resume);

    expect($text)->toBe("Ada Lovelace\n\nMathematician and writer");
});

it('rejects a resume when no readable text is extracted', function () {
    $resume = new Resume([
        'disk' => 'local',
        'path' => 'resumes/1/scanned.pdf',
        'extension' => 'pdf',
    ]);
    $disk = mock(Filesystem::class);
    $disk->shouldReceive('get')->once()->andReturn('%PDF contents');
    Storage::shouldReceive('disk')->once()->andReturn($disk);
    $document = mock(Document::class);
    $document->shouldReceive('getText')->once()->andReturn('');
    $parser = mock(Parser::class);
    $parser->shouldReceive('parseContent')->once()->andReturn($document);

    expect(fn () => (new ResumeTextExtractor($parser))->extract($resume))
        ->toThrow(RuntimeException::class, 'No readable text was found');
});
