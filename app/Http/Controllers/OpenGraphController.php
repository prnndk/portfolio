<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OpenGraphController extends Controller
{
    /**
     * Generate OpenGraph image for blog posts
     */
    public function blog(Request $request, string $slug)
    {
        $post = \App\Models\Post::where('slug', $slug)->firstOrFail();

        return $this->generateImage(
            title: $post->title,
            subtitle: 'Blog Post',
            date: $post->published_at
                ? $post->published_at->format('M d, Y')
                : null
        );
    }

    /**
     * Generate OpenGraph image for projects
     */
    public function project(Request $request, string $slug)
    {
        $project = \App\Models\Project::where('slug', $slug)->firstOrFail();

        return $this->generateImage(
            title: $project->title,
            subtitle: 'Project',
            tags: $project->tech_tags ? array_slice($project->tech_tags, 0, 4) : null
        );
    }

    /**
     * Generate OpenGraph image dynamically via query params
     */
    public function generate(Request $request)
    {
        $request->validate([
            'title'    => 'nullable|string|max:120',
            'subtitle' => 'nullable|string|max:80',
            'date'     => 'nullable|string|max:30',
            'tags'     => 'nullable|string|max:200',
        ]);

        $title = $request->get('title', 'aryagading.com');
        $subtitle = $request->get('subtitle');
        $date = $request->get('date');
        $tags = $request->get('tags') ? array_slice(explode(',', $request->get('tags')), 0, 6) : null;

        return $this->generateImage($title, $subtitle, $date, $tags);
    }

    /**
     * Generate the OpenGraph image - Clean minimal design
     */
    private function generateImage(
        string $title,
        ?string $subtitle = null,
        ?string $date = null,
        ?array $tags = null
    ) {
        try {
            // Create image dimensions (standard OG size)
            $width = 1200;
            $height = 630;

            // Create the image
            $image = imagecreatetruecolor($width, $height);

            // Enable anti-aliasing if available
            if (function_exists('imageantialias')) {
                imageantialias($image, true);
            }

            // Define colors
            $colorTop = imagecolorallocate($image, 26, 42, 74);      // #1a2a4a
            $colorBottom = imagecolorallocate($image, 13, 20, 33);   // #0d1421
            $colorWhite = imagecolorallocate($image, 255, 255, 255);
            $colorGray = imagecolorallocate($image, 148, 163, 184);  // Muted text
            $colorAccent = imagecolorallocate($image, 96, 165, 250); // Blue accent

            // Draw gradient background
            for ($y = 0; $y < $height; $y++) {
                $ratio = $y / $height;
                $r = (int) (26 - (26 - 13) * $ratio);
                $g = (int) (42 - (42 - 20) * $ratio);
                $b = (int) (74 - (74 - 33) * $ratio);
                $lineColor = imagecolorallocate($image, $r, $g, $b);
                imageline($image, 0, $y, $width, $y, $lineColor);
            }

            // Add subtle accent circle in background
            $accentCircle = imagecolorallocatealpha($image, 59, 130, 246, 120);
            imagefilledellipse($image, 1000, 150, 400, 400, $accentCircle);
            imagefilledellipse($image, 200, 550, 300, 300, $accentCircle);

            // Load fonts
            $fontBold = public_path('fonts/Inter-Bold.ttf');
            $fontRegular = public_path('fonts/Inter-Regular.ttf');
            $hasFonts = file_exists($fontBold) && file_exists($fontRegular);

            if (!$hasFonts) {
                \Illuminate\Support\Facades\Log::warning('OpenGraph fonts not found at: ' . $fontBold);
            }

            // Wrap title text - max 26 chars per line
            $titleLines = $this->wrapText($title, 26);

            // Calculate vertical layout
            $titleFontSize = 52;
            $titleLineHeight = 70;
            $subtitleFontSize = 22;

            // Calculate total content height
            $contentHeight = count($titleLines) * $titleLineHeight;
            if ($subtitle || $date)
                $contentHeight += 60;
            if ($tags)
                $contentHeight += 50;

            // Start position (vertically centered)
            $startY = ($height - $contentHeight) / 2 + 20;
            $currentY = $startY;

            // Draw title lines
            foreach ($titleLines as $index => $line) {
                if ($hasFonts) {
                    $bbox = imagettfbbox($titleFontSize, 0, $fontBold, $line);
                    $textWidth = $bbox[2] - $bbox[0];
                    $x = ($width - $textWidth) / 2;
                    imagettftext($image, $titleFontSize, 0, (int) $x, (int) $currentY, $colorWhite, $fontBold, $line);
                } else {
                    $charWidth = imagefontwidth(5);
                    $x = ($width - strlen($line) * $charWidth) / 2;
                    imagestring($image, 5, (int) $x, (int) ($currentY - 20), $line, $colorWhite);
                }
                $currentY += $titleLineHeight;
            }

            // Add some spacing
            $currentY += 15;

            // Draw subtitle/date
            if ($subtitle || $date) {
                $subtitleText = $date ? ($subtitle ? "$subtitle  •  $date" : $date) : $subtitle;

                if ($hasFonts) {
                    $bbox = imagettfbbox($subtitleFontSize, 0, $fontRegular, $subtitleText);
                    $textWidth = $bbox[2] - $bbox[0];
                    $x = ($width - $textWidth) / 2;
                    imagettftext($image, $subtitleFontSize, 0, (int) $x, (int) $currentY, $colorGray, $fontRegular, $subtitleText);
                } else {
                    $charWidth = imagefontwidth(4);
                    $x = ($width - strlen($subtitleText) * $charWidth) / 2;
                    imagestring($image, 4, (int) $x, (int) ($currentY - 10), $subtitleText, $colorGray);
                }
                $currentY += 45;
            }

            // Draw tags
            if ($tags && count($tags) > 0) {
                $tagFontSize = 16;
                $tagText = implode('  •  ', $tags);

                if ($hasFonts) {
                    $bbox = imagettfbbox($tagFontSize, 0, $fontRegular, $tagText);
                    $textWidth = $bbox[2] - $bbox[0];
                    $x = ($width - $textWidth) / 2;
                    imagettftext($image, $tagFontSize, 0, (int) $x, (int) $currentY, $colorAccent, $fontRegular, $tagText);
                } else {
                    $charWidth = imagefontwidth(3);
                    $x = ($width - strlen($tagText) * $charWidth) / 2;
                    imagestring($image, 3, (int) $x, (int) ($currentY - 8), $tagText, $colorAccent);
                }
            }

            // Draw horizontal accent line
            $lineY = $height - 80;
            $lineWidth = 120;
            $lineX = ($width - $lineWidth) / 2;
            imagesetthickness($image, 3);
            imageline($image, (int) $lineX, $lineY, (int) ($lineX + $lineWidth), $lineY, $colorAccent);

            // Draw branding at bottom
            $brandText = 'aryagading.com';
            if ($hasFonts) {
                $bbox = imagettfbbox(18, 0, $fontRegular, $brandText);
                $textWidth = $bbox[2] - $bbox[0];
                imagettftext($image, 18, 0, (int) (($width - $textWidth) / 2), $height - 35, $colorGray, $fontRegular, $brandText);
            } else {
                $charWidth = imagefontwidth(3);
                imagestring($image, 3, (int) (($width - strlen($brandText) * $charWidth) / 2), $height - 40, $brandText, $colorGray);
            }

            // Output the image
            ob_start();
            imagepng($image);
            $imageData = ob_get_clean();

            // Free memory
            imagedestroy($image);

            return response($imageData)
                ->header('Content-Type', 'image/png')
                ->header('Cache-Control', 'public, max-age=86400');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('OpenGraph generation failed: ' . $e->getMessage());

            // Use default OpenGraph image on failure
            return redirect(config('app.url') . '/opengraph.png');
        }
    }

    /**
     * Wrap text to fit within max chars per line
     */
    private function wrapText(string $text, int $maxCharsPerLine): array
    {
        $words = explode(' ', $text);
        $lines = [];
        $currentLine = '';

        foreach ($words as $word) {
            $testLine = $currentLine ? "$currentLine $word" : $word;

            if (strlen($testLine) > $maxCharsPerLine) {
                if ($currentLine) {
                    $lines[] = $currentLine;
                    $currentLine = $word;
                } else {
                    $lines[] = substr($word, 0, $maxCharsPerLine - 3) . '...';
                    $currentLine = '';
                }
            } else {
                $currentLine = $testLine;
            }
        }

        if ($currentLine) {
            $lines[] = $currentLine;
        }

        // Limit to 3 lines max
        if (count($lines) > 3) {
            $lines = array_slice($lines, 0, 3);
            $lines[2] = substr($lines[2], 0, $maxCharsPerLine - 6) . '...';
        }

        return $lines;
    }
}
