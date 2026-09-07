<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreApplicationRequest;
use App\Http\Requests\Api\V1\UpdateApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ApplicationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->applications()->latest('updated_at');

        if (in_array($request->query('status'), ['wishlist', 'applied', 'interview', 'offer', 'rejected'], true)) {
            $query->where('status', $request->query('status'));
        }

        return ApplicationResource::collection($query->paginate(20));
    }

    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $validated = $request->validated();
        if (isset($validated['job_description_id'])) {
            $request->user()->jobDescriptions()->findOrFail($validated['job_description_id']);
        }

        $application = $request->user()->applications()->create($validated);

        return (new ApplicationResource($application))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateApplicationRequest $request, Application $application): ApplicationResource
    {
        $ownedApplication = $request->user()->applications()->findOrFail($application->id);
        $ownedApplication->update($request->validated());

        return new ApplicationResource($ownedApplication->refresh());
    }

    public function destroy(Request $request, Application $application): Response
    {
        $request->user()->applications()->findOrFail($application->id)->delete();

        return response()->noContent();
    }
}
