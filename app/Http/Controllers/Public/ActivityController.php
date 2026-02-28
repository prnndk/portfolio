<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Public/Activities/Index', [
            'activities' => Activity::active()->ordered()->paginate(10),
        ]);
    }

    public function show(Activity $activity): Response
    {
        if (! $activity->is_active) {
            abort(404);
        }

        return Inertia::render('Public/Activities/Show', [
            'activity' => $activity,
        ]);
    }
}
