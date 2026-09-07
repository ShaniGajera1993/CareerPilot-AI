<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $analyses = $user->resumeAnalyses()->latest()->take(8)->get(['score', 'result', 'created_at']);
        $interviews = $user->interviews();
        $applications = $user->applications();
        $statusCounts = (clone $applications)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        $missingSkills = $analyses->flatMap(fn ($analysis) => $analysis->result['missing_keywords'] ?? [])->countBy()->sortDesc()->take(6);
        $matchedSkills = $analyses->flatMap(fn ($analysis) => $analysis->result['matched_keywords'] ?? [])->countBy()->sortDesc()->take(6);
        $averageInterviewScore = (clone $interviews)->whereNotNull('overall_score')->avg('overall_score');

        return response()->json(['data' => [
            'applications' => [
                'total' => (clone $applications)->count(),
                'by_status' => collect(['wishlist', 'applied', 'interview', 'offer', 'rejected'])->mapWithKeys(fn ($status) => [$status => (int) ($statusCounts[$status] ?? 0)]),
            ],
            'ats' => [
                'average' => $analyses->isEmpty() ? null : round($analyses->avg('score')),
                'latest' => $analyses->first()?->score,
                'trend' => $analyses->reverse()->values()->map(fn ($analysis) => ['score' => $analysis->score, 'date' => $analysis->created_at->toDateString()]),
            ],
            'interviews' => [
                'total' => (clone $interviews)->count(),
                'completed' => (clone $interviews)->whereNotNull('completed_at')->count(),
                'average_score' => $averageInterviewScore === null ? null : round($averageInterviewScore),
            ],
            'skills' => ['matched' => $matchedSkills, 'missing' => $missingSkills],
        ]]);
    }
}
