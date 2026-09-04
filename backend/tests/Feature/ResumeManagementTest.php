<?php

use App\Models\Resume;
use App\Models\User;
use Illuminate\Filesystem\Filesystem as LaravelFilesystem;
use Illuminate\Filesystem\LocalFilesystemAdapter as LaravelLocalFilesystemAdapter;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\Filesystem as Flysystem;
use League\Flysystem\Local\LocalFilesystemAdapter as FlysystemLocalFilesystemAdapter;
use League\MimeTypeDetection\ExtensionMimeTypeDetector;
use ZipArchive;

uses(LazilyRefreshDatabase::class);

function validPdfResume(string $name = 'ada-lovelace-resume.pdf'): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        $name,
        "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF",
    );
}

function validDocxResume(string $name = 'ada-lovelace-resume.docx'): UploadedFile
{
    $archivePath = tempnam(sys_get_temp_dir(), 'resume-docx-');
    $archive = new ZipArchive;
    $archive->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    $archive->addFromString('[Content_Types].xml', '<Types></Types>');
    $archive->addFromString('word/document.xml', '<document></document>');
    $archive->close();
    $contents = file_get_contents($archivePath);
    unlink($archivePath);

    return UploadedFile::fake()->createWithContent($name, $contents);
}

function fakeResumeStorage(): LaravelLocalFilesystemAdapter
{
    $root = storage_path('framework/testing/disks/resumes');
    $filesystem = new LaravelFilesystem;

    if ($filesystem->isDirectory($root)) {
        $filesystem->cleanDirectory($root);
    } else {
        $filesystem->makeDirectory($root, 0755, true);
    }

    $adapter = new FlysystemLocalFilesystemAdapter(
        $root,
        mimeTypeDetector: new ExtensionMimeTypeDetector,
    );
    $disk = new LaravelLocalFilesystemAdapter(
        new Flysystem($adapter),
        $adapter,
        ['root' => $root],
    );
    Storage::set('local', $disk);

    return $disk;
}

it('uploads supported resumes to private storage', function (UploadedFile $file, string $extension) {
    $storage = fakeResumeStorage();
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->post('/api/v1/resumes', [
            'resume' => $file,
        ], ['Accept' => 'application/json']);

    $response
        ->assertCreated()
        ->assertJsonPath('data.name', $file->getClientOriginalName())
        ->assertJsonPath('data.extension', $extension)
        ->assertJsonPath('data.status', 'uploaded')
        ->assertJsonMissingPath('data.path');

    $resume = Resume::query()->firstOrFail();

    expect($resume->user_id)->toBe($user->id);
    $storage->assertExists($resume->path);
})->with([
    'PDF' => fn () => [validPdfResume(), 'pdf'],
    'DOCX' => fn () => [validDocxResume(), 'docx'],
]);

it('lists only resumes belonging to the authenticated user newest first', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    Resume::factory()->for($user)->create([
        'original_name' => 'older.pdf',
        'created_at' => now()->subDay(),
    ]);
    Resume::factory()->for($user)->create([
        'original_name' => 'newer.pdf',
        'created_at' => now(),
    ]);
    Resume::factory()->for($otherUser)->create([
        'original_name' => 'private.pdf',
    ]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/resumes')
        ->assertSuccessful()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('data.0.name', 'newer.pdf')
        ->assertJsonPath('data.1.name', 'older.pdf')
        ->assertJsonMissing(['path', 'disk'])
        ->assertJsonMissing(['private.pdf']);
});

it('paginates a growing resume library', function () {
    $user = User::factory()->create();
    Resume::factory()->count(12)->for($user)->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/resumes?page=2')
        ->assertSuccessful()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.current_page', 2)
        ->assertJsonPath('meta.total', 12);
});

it('rejects unsupported or disguised files', function (UploadedFile $file) {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->post('/api/v1/resumes', ['resume' => $file], ['Accept' => 'application/json'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('resume');

    expect(Resume::query()->count())->toBe(0);
})->with([
    'plain text' => fn () => UploadedFile::fake()->createWithContent('resume.txt', 'hello'),
    'disguised PDF' => fn () => UploadedFile::fake()->createWithContent('resume.pdf', 'not a PDF'),
    'oversized PDF' => fn () => UploadedFile::fake()->create('resume.pdf', 10_241, 'application/pdf'),
]);

it('requires authentication to upload or list resumes', function (string $method) {
    $response = $method === 'get'
        ? $this->getJson('/api/v1/resumes')
        : $this->post(
            '/api/v1/resumes',
            ['resume' => validPdfResume()],
            ['Accept' => 'application/json'],
        );

    $response->assertUnauthorized();
})->with(['get', 'post']);
