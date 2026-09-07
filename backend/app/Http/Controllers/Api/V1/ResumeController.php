<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreResumeRequest;
use App\Http\Requests\Api\V1\UpdateResumeRequest;
use App\Http\Resources\ResumeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class ResumeController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ResumeResource::collection(
            $request->user()->resumes()->latest()->paginate(10),
        );
    }

    public function store(StoreResumeRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('resume');
        $extension = strtolower($file->getClientOriginalExtension());
        $originalName = basename(str_replace('\\', '/', $file->getClientOriginalName()));
        $path = $file->storeAs(
            "resumes/{$user->getKey()}",
            Str::uuid().'.'.$extension,
            'local',
        );

        if ($path === false) {
            throw new RuntimeException('The resume could not be stored.');
        }

        try {
            $resume = $user->resumes()->create([
                'original_name' => $originalName,
                'disk' => 'local',
                'path' => $path,
                'mime_type' => match ($extension) {
                    'pdf' => 'application/pdf',
                    'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                },
                'extension' => $extension,
                'size_bytes' => $file->getSize(),
                'status' => 'uploaded',
            ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($path);

            throw $exception;
        }

        return (new ResumeResource($resume))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateResumeRequest $request, int $resume): ResumeResource
    {
        $ownedResume = $request->user()->resumes()->findOrFail($resume);
        $ownedResume->update([
            'parsed_content' => $request->validated(),
            'parsed_at' => $ownedResume->parsed_at ?? now(),
            'status' => 'parsed',
        ]);

        return new ResumeResource($ownedResume->refresh());
    }
}
