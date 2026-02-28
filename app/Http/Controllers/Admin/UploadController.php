<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class UploadController extends Controller
{
    /**
     * Upload an image for use in blog post content.
     * Returns the URL of the uploaded image.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => [
                'required',
                'image',
                'max:5120', // 5MB max
                'mimes:jpeg,jpg,png,gif,webp',
            ],
        ]);

        $file     = $request->file('image');
        $filename = Str::uuid() . '.webp';
        $dir      = 'posts/content';

        // Resize to max 1200 px wide and encode as WebP at 85% quality
        $encoded = Image::read($file->getPathname())
            ->scaleDown(width: 1200)
            ->toWebp(quality: 85);

        Storage::disk('public')->put("{$dir}/{$filename}", $encoded);

        $path = "{$dir}/{$filename}";

        return response()->json([
            'success' => true,
            'url'     => asset('storage/' . $path),
            'path'    => $path,
        ]);
    }

    /**
     * Delete an uploaded image.
     * Used when removing images from content or when a post is deleted.
     */
    public function deleteImage(Request $request)
    {
        $request->validate([
            'path' => ['required', 'string', 'max:255'],
        ]);

        $path = $request->input('path');

        // Security: Reject null bytes, directory traversal sequences, and
        // encoded variants before any filesystem interaction.
        if (
            Str::contains($path, ['..', '//', "\0", '%2e', '%2f', '%00']) ||
            !Str::startsWith($path, 'posts/content/')
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid path',
            ], 403);
        }

        // Canonicalize and verify the resolved path stays inside the
        // intended storage directory (defence-in-depth against any
        // bypass of the string checks above).
        $storageDisk = Storage::disk('public');
        $fullPath    = $storageDisk->path($path);
        $allowedDir  = $storageDisk->path('posts/content');

        if (!str_starts_with(realpath($fullPath) ?: '', realpath($allowedDir) ?: $allowedDir)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid path',
            ], 403);
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json([
                'success' => true,
                'message' => 'Image deleted',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Image not found',
        ], 404);
    }
}
