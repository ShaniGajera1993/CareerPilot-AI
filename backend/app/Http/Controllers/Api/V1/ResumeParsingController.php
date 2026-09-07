<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResumeResource;
use App\Services\OllamaResumeParser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ResumeParsingController extends Controller
{
    public function __invoke(Request $request, int $resume, OllamaResumeParser $parser): JsonResponse
    {
        $ownedResume = $request->user()->resumes()->findOrFail($resume);

        $ownedResume->update(['status' => 'parsing']);

        try {
            $parsedContent = $parser->parse($ownedResume);
            $ownedResume->update([
                'status' => 'parsed',
                'parsed_content' => $parsedContent,
                'parsed_at' => now(),
            ]);
        } catch (Throwable $exception) {
            report($exception);
            $ownedResume->update(['status' => 'parse_failed']);

            return response()->json([
                'message' => 'CareerPilot could not parse this resume. Try again shortly.',
            ], Response::HTTP_BAD_GATEWAY);
        }

        return (new ResumeResource($ownedResume->refresh()))->response();
    }
}
