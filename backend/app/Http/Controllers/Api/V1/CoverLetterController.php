<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\GenerateCareerContentRequest;
use App\Http\Resources\CoverLetterResource;
use App\Services\OllamaCareerCoach;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class CoverLetterController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return CoverLetterResource::collection(
            $request->user()->coverLetters()
                ->with(['resume:id,original_name', 'jobDescription:id,title,company'])
                ->latest()
                ->paginate(10),
        );
    }

    public function store(GenerateCareerContentRequest $request, OllamaCareerCoach $coach): JsonResponse
    {
        $user = $request->user();
        $resume = $user->resumes()->findOrFail($request->integer('resume_id'));
        $jobDescription = $user->jobDescriptions()->findOrFail($request->integer('job_description_id'));

        if ($resume->status !== 'parsed' || ! is_array($resume->parsed_content)) {
            throw ValidationException::withMessages([
                'resume_id' => ['Parse this resume before generating a cover letter.'],
            ]);
        }

        $tone = $request->string('tone', 'professional')->toString();
        $coverLetter = $user->coverLetters()->create([
            'resume_id' => $resume->id,
            'job_description_id' => $jobDescription->id,
            'tone' => $tone,
            'content' => $coach->coverLetter($resume, $jobDescription, $tone),
        ])->load(['resume:id,original_name', 'jobDescription:id,title,company']);

        return (new CoverLetterResource($coverLetter))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
