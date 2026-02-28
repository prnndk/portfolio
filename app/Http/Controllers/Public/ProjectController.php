<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Public/Projects/Index', [
            'projects' => Project::active()->ordered()->paginate(9),
        ]);
    }

    public function show(Project $project): Response
    {
        if (! $project->is_active) {
            abort(404);
        }

        return Inertia::render('Public/Projects/Show', [
            'project' => $project,
        ]);
    }
}
