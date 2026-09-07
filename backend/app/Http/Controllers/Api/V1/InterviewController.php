<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\EvaluateInterviewRequest;
use App\Http\Requests\Api\V1\GenerateInterviewRequest;
use App\Http\Resources\InterviewResource;
use App\Models\Interview;
use App\Services\OllamaCareerCoach;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class InterviewController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return InterviewResource::collection(
            $request->user()->interviews()->with(['resume:id,original_name', 'jobDescription:id,title,company'])->latest()->paginate(10),
        );
    }

    public function store(GenerateInterviewRequest $request, OllamaCareerCoach $coach): JsonResponse
    {
        $resume = $request->user()->resumes()->findOrFail($request->integer('resume_id'));
        $job = $request->user()->jobDescriptions()->findOrFail($request->integer('job_description_id'));
        if ($resume->status !== 'parsed') {
            throw ValidationException::withMessages(['resume_id' => ['Parse this resume before preparing an interview.']]);
        }

        $focus = $request->string('focus', 'mixed')->toString();
        $questions = $coach->interviewQuestions($resume, $job, $focus);
        $interview = $request->user()->interviews()->create([
            'resume_id' => $resume->id,
            'job_description_id' => $job->id,
            'focus' => $focus,
            'questions' => $questions,
        ])->load(['resume:id,original_name', 'jobDescription:id,title,company']);

        return (new InterviewResource($interview))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function evaluate(EvaluateInterviewRequest $request, Interview $interview, OllamaCareerCoach $coach): InterviewResource
    {
        $ownedInterview = $request->user()->interviews()->with(['resume', 'jobDescription'])->findOrFail($interview->id);
        $answers = $request->validated('answers');
        $feedback = $coach->evaluateInterview($ownedInterview, $answers);
        $score = $feedback['overall_score'] ?? null;
        if (! is_int($score) || $score < 0 || $score > 100) {
            throw new RuntimeException('Ollama returned an invalid interview score.');
        }

        $ownedInterview->update(['answers' => $answers, 'overall_score' => $score, 'feedback' => $feedback, 'completed_at' => now()]);

        return new InterviewResource($ownedInterview->refresh()->load(['resume:id,original_name', 'jobDescription:id,title,company']));
    }
}
