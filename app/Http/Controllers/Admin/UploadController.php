<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        $file = $request->file('image');

        // Generate a unique filename to prevent overwrites and path traversal
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Store in a dedicated uploads folder for post content
        $path = $file->storeAs('posts/content', $filename, 'public');

        // Return the public URL
        return response()->json([
            'success' => true,
            'url' => asset('storage/' . $path),
            'path' => $path,
        ]);
    }

    /**
     * Delete an uploaded image.
     * Used when removing images from content or when a post is deleted.
     */
    public function deleteImage(Request $request)
    {
        $request->validate([
            'path' => ['required', 'string'],
        ]);

        $path = $request->input('path');

        // Security: Only allow deleting from posts/content directory
        if (!Str::startsWith($path, 'posts/content/')) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid path',
            ], 403);
        }

        // Security: Prevent directory traversal
        if (Str::contains($path, ['..', '//'])) {
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
