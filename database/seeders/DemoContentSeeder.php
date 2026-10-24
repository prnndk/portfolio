<?php

namespace Database\Seeders;

use App\Models\Favorite;
use App\Models\Post;
use App\Models\Project;
use App\Models\Tag;
use App\Models\TechStack;
use Illuminate\Database\Seeder;

/**
 * Placeholder content so every public page can be previewed with data.
 * Experience (journeys/activities) comes from ExperienceSeeder instead.
 *
 *   php artisan db:seed --class=DemoContentSeeder
 *
 * Safe to re-run (rows are matched by slug/title). Remove again with:
 *
 *   php artisan tinker --execute="(new Database\Seeders\DemoContentSeeder)->purge();"
 */
class DemoContentSeeder extends Seeder
{
    private const TECH = [
        ['Laravel', 'Backend', 'laravel/laravel-original', 'advanced'],
        ['PHP', 'Backend', 'php/php-original', 'advanced'],
        ['Go', 'Backend', 'go/go-original', 'intermediate'],
        ['Node.js', 'Backend', 'nodejs/nodejs-original', 'advanced'],
        ['Python', 'Backend', 'python/python-original', 'intermediate'],
        ['React', 'Frontend', 'react/react-original', 'advanced'],
        ['Next.js', 'Frontend', 'nextjs/nextjs-original', 'advanced'],
        ['TypeScript', 'Frontend', 'typescript/typescript-original', 'advanced'],
        ['Tailwind CSS', 'Frontend', 'tailwindcss/tailwindcss-original', 'advanced'],
        ['Flutter', 'Mobile', 'flutter/flutter-original', 'intermediate'],
        ['Docker', 'Infrastructure', 'docker/docker-original', 'advanced'],
        ['Nginx', 'Infrastructure', 'nginx/nginx-original', 'intermediate'],
        ['AWS', 'Infrastructure', 'amazonwebservices/amazonwebservices-original-wordmark', 'intermediate'],
        ['MySQL', 'Database', 'mysql/mysql-original', 'advanced'],
        ['PostgreSQL', 'Database', 'postgresql/postgresql-original', 'intermediate'],
        ['Redis', 'Database', 'redis/redis-original', 'intermediate'],
    ];

    private const PROJECTS = [
        ['demo-fleet-tracker', 'Fleet Tracker', 'Live vehicle tracking with geofence alerts and route replay for a regional logistics team.', ['Laravel', 'React', 'MySQL', 'Docker'], true],
        ['demo-campus-hub', 'Campus Hub', 'Mobile app that brings class schedules, announcements and event check-ins into one place.', ['Flutter', 'Go', 'PostgreSQL'], true],
        ['demo-invoice-flow', 'Invoice Flow', 'Invoicing and payment reminders for small businesses, with PDF export and recurring billing.', ['Laravel', 'Tailwind CSS', 'Redis'], false],
        ['demo-doc-assistant', 'Doc Assistant', 'Retrieval-augmented chat over internal documents, with source citations and usage analytics.', ['Python', 'TypeScript', 'PostgreSQL'], true],
        ['demo-deploy-kit', 'Deploy Kit', 'One-command Docker and Nginx deployment scripts with zero-downtime releases.', ['Docker', 'Nginx', 'AWS'], false],
        ['demo-pdf-toolbox', 'PDF Toolbox', 'Browser-only PDF merge, split and compress tools. Files never leave the device.', ['React', 'TypeScript'], false],
    ];

    private const POSTS = [
        ['demo-zero-downtime-laravel', 'Zero-downtime deploys for Laravel with Docker', 'How I ship Laravel updates behind Nginx without dropping a single request.', ['Laravel', 'DevOps'], 3],
        ['demo-inertia-ssr-notes', 'Notes on Inertia SSR in production', 'What broke, what helped, and the settings I would copy next time.', ['React', 'Laravel'], 12],
        ['demo-client-side-pdf', 'Processing PDFs entirely in the browser', 'pdf-lib, pdf.js and a few tricks to keep large files from freezing the tab.', ['React', 'Tutorial'], 27],
        ['demo-learning-in-public', 'Why I learn in public', 'A short reflection on writing things down while they are still confusing.', ['Career'], 45],
    ];

    private const FAVORITES = [
        ['demo-interstellar', 'Interstellar', 'movie', 'Christopher Nolan', '2014', 'Sci-fi', 10, 'A space epic that is really about time, family and a very loud organ.'],
        ['demo-spirited-away', 'Spirited Away', 'movie', 'Hayao Miyazaki', '2001', 'Animation', 9, 'Comfort-watch material, every single time.'],
        ['demo-parasite', 'Parasite', 'movie', 'Bong Joon-ho', '2019', 'Thriller', 9, 'Sharp, funny and uncomfortable in the best way.'],
        ['demo-a-sky-full-of-stars', 'A Sky Full of Stars', 'music', 'Coldplay', '2014', 'Pop', 9, 'The track that gets me through late-night debugging.'],
        ['demo-berharap-tak-berpisah', 'Berharap Tak Berpisah', 'music', 'Reza Artamevia', '2000', 'Pop', 8, 'Nostalgia in song form.'],
        ['demo-atomic-habits', 'Atomic Habits', 'book', 'James Clear', '2018', 'Self-improvement', 9, 'Small systems beat big motivation.'],
        ['demo-clean-code', 'Clean Code', 'book', 'Robert C. Martin', '2008', 'Programming', 8, 'Opinionated, useful, occasionally preachy.'],
    ];

    public function run(): void
    {
        foreach (self::TECH as $i => [$name, $category, $icon, $level]) {
            TechStack::updateOrCreate(['name' => $name], [
                'icon_url' => "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{$icon}.svg",
                'category' => $category,
                'proficiency' => $level,
                'sort_order' => $i,
                'is_active' => true,
                'show_in_orbit' => $i < 9,
            ]);
        }

        foreach (self::PROJECTS as $i => [$slug, $title, $description, $tags, $featured]) {
            Project::updateOrCreate(['slug' => $slug], [
                'title' => $title,
                'description' => $description,
                'image_url' => "https://picsum.photos/seed/{$slug}/1200/750",
                'gallery_urls' => collect(range(1, 3))->map(fn ($n) => "https://picsum.photos/seed/{$slug}-{$n}/1200/750")->all(),
                'tech_tags' => $tags,
                'url' => 'https://example.com',
                'github_url' => 'https://github.com/prnndk',
                'featured' => $featured,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        foreach (self::POSTS as [$slug, $title, $excerpt, $tags, $daysAgo]) {
            $post = Post::updateOrCreate(['slug' => $slug], [
                'title' => $title,
                'excerpt' => $excerpt,
                'featured_image_url' => "https://picsum.photos/seed/{$slug}/1200/630",
                'content' => $this->markdown($title, $excerpt),
                'status' => 'published',
                'published_at' => now()->subDays($daysAgo),
                'is_active' => true,
            ]);
            $post->tags()->syncWithoutDetaching(
                collect($tags)->map(fn ($t) => Tag::firstOrCreate(['slug' => str($t)->slug()], ['name' => $t])->id)->all()
            );
        }

        foreach (self::FAVORITES as $i => [$slug, $title, $type, $creator, $year, $genre, $rating, $description]) {
            Favorite::updateOrCreate(['slug' => $slug], [
                'title' => $title,
                'type' => $type,
                'creator' => $creator,
                'year' => $year,
                'genre' => $genre,
                'rating' => $rating,
                'description' => $description,
                'content' => $description,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

    }

    /** Remove everything this seeder created. */
    public function purge(): void
    {
        TechStack::whereIn('name', array_column(self::TECH, 0))->delete();
        Project::whereIn('slug', array_column(self::PROJECTS, 0))->delete();
        Post::whereIn('slug', array_column(self::POSTS, 0))->each(function (Post $post) {
            $post->tags()->detach();
            $post->delete();
        });
        Favorite::whereIn('slug', array_column(self::FAVORITES, 0))->delete();
    }

    private function markdown(string $title, string $excerpt): string
    {
        return <<<MD
# {$title}

{$excerpt}

## Why it matters

This is placeholder text so the article layout, table of contents and typography can be previewed.

- A short list item
- Another point worth making
- A third one for rhythm

## A code sample

```php
Route::get('/health', fn () => response()->json(['ok' => true]));
```

## Wrapping up

> Replace this demo post from the admin dashboard when you are ready.
MD;
    }
}
