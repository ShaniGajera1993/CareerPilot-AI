<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\GenerateCareerContentRequest;
use App\Http\Resources\ResumeAnalysisResource;
use App\Services\OllamaCareerCoach;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class ResumeAnalysisController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ResumeAnalysisResource::collection(
            $request->user()->resumeAnalyses()
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
                'resume_id' => ['Parse this resume before analyzing it.'],
            ]);
        }

        $result = $coach->analyze($resume, $jobDescription);
        $score = $result['score'] ?? null;

        if (! is_int($score) || $score < 0 || $score > 100) {
            throw new RuntimeException('Ollama returned an invalid ATS score.');
        }

        $analysis = $user->resumeAnalyses()->create([
            'resume_id' => $resume->id,
            'job_description_id' => $jobDescription->id,
            'score' => $score,
            'result' => $result,
        ])->load(['resume:id,original_name', 'jobDescription:id,title,company']);

        return (new ResumeAnalysisResource($analysis))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
