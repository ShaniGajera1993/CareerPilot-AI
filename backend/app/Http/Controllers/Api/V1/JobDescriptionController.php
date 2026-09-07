<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreJobDescriptionRequest;
use App\Http\Resources\JobDescriptionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class JobDescriptionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return JobDescriptionResource::collection(
            $request->user()->jobDescriptions()->latest()->paginate(10),
        );
    }

    public function store(StoreJobDescriptionRequest $request): JsonResponse
    {
        $jobDescription = $request->user()
            ->jobDescriptions()
            ->create($request->validated());

        return (new JobDescriptionResource($jobDescription))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
