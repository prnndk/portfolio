<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    private const ALLOWED_TYPES = ['movie', 'music', 'book'];

    public function index(Request $request): Response
    {
        $type  = $request->get('type');
        $query = Favorite::active()->ordered();

        if ($type && in_array($type, self::ALLOWED_TYPES, strict: true)) {
            $query->ofType($type);
        }

        return Inertia::render('Public/Favorites/Index', [
            'favorites'   => $query->paginate(12),
            'currentType' => $type,
        ]);
    }
}
