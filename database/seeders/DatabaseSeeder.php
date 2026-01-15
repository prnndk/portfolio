<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Post;
use App\Models\Project;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Sample Projects
        Project::create([
            'title' => 'E-Commerce Platform',
            'description' => 'A full-featured e-commerce platform built with Laravel and React. Features include product management, shopping cart, payment integration, and admin dashboard.',
            'tech_tags' => ['Laravel', 'React', 'MySQL', 'Stripe', 'Tailwind CSS'],
            'url' => 'https://example.com',
            'github_url' => 'https://github.com/example/ecommerce',
            'featured' => true,
            'sort_order' => 1,
        ]);

        Project::create([
            'title' => 'Task Management App',
            'description' => 'A collaborative task management application with real-time updates, team workspaces, and Kanban boards.',
            'tech_tags' => ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Socket.io'],
            'url' => 'https://example.com/tasks',
            'github_url' => 'https://github.com/example/taskapp',
            'featured' => true,
            'sort_order' => 2,
        ]);

        Project::create([
            'title' => 'Weather Dashboard',
            'description' => 'A beautiful weather dashboard that displays current conditions and forecasts using data from multiple weather APIs.',
            'tech_tags' => ['Vue.js', 'Node.js', 'Express', 'Chart.js'],
            'featured' => true,
            'sort_order' => 3,
        ]);

        // Sample Activities
        Activity::create([
            'title' => 'Senior Full-Stack Developer',
            'role' => 'Technical Lead',
            'organization' => 'Tech Startup Inc.',
            'description' => 'Leading a team of 5 developers in building scalable web applications. Responsible for architecture decisions and code reviews.',
            'start_date' => '2023-01-01',
            'end_date' => null,
            'sort_order' => 1,
        ]);

        Activity::create([
            'title' => 'Full-Stack Developer',
            'role' => 'Developer',
            'organization' => 'Digital Agency Co.',
            'description' => 'Developed custom web applications for clients across various industries. Worked with React, Laravel, and AWS.',
            'start_date' => '2021-06-01',
            'end_date' => '2022-12-31',
            'sort_order' => 2,
        ]);

        Activity::create([
            'title' => 'Computer Science Degree',
            'role' => 'Student',
            'organization' => 'University of Technology',
            'description' => 'Bachelor of Science in Computer Science with focus on Software Engineering and Web Technologies.',
            'start_date' => '2017-09-01',
            'end_date' => '2021-05-31',
            'sort_order' => 3,
        ]);

        // Sample Blog Posts
        Post::create([
            'title' => 'Getting Started with Laravel and Inertia.js',
            'content' => "# Getting Started with Laravel and Inertia.js\n\nInertia.js is a fantastic way to build modern single-page applications using classic server-side routing and controllers.\n\n## Why Inertia?\n\n- No API required\n- Full page reloads without the flash\n- Server-side routing\n- Component-based development\n\n## Installation\n\n```bash\ncomposer require inertiajs/inertia-laravel\nnpm install @inertiajs/react\n```\n\n## Conclusion\n\nInertia.js bridges the gap between traditional server-rendered apps and modern SPAs.",
            'excerpt' => 'Learn how to set up a modern Laravel application with Inertia.js and React for building seamless single-page experiences.',
            'status' => 'published',
            'published_at' => now(),
        ]);

        Post::create([
            'title' => 'Mastering Framer Motion Animations',
            'content' => "# Mastering Framer Motion Animations\n\nFramer Motion is a production-ready motion library for React that makes creating animations simple and powerful.\n\n## Basic Animations\n\n```jsx\n<motion.div\n  initial={{ opacity: 0 }}\n  animate={{ opacity: 1 }}\n  transition={{ duration: 0.5 }}\n>\n  Hello World\n</motion.div>\n```\n\n## Gestures\n\nFramer Motion supports hover, tap, drag, and more.\n\n## Conclusion\n\nWith Framer Motion, you can create stunning animations with minimal code.",
            'excerpt' => 'A comprehensive guide to creating beautiful animations in React using the Framer Motion library.',
            'status' => 'published',
            'published_at' => now()->subDays(7),
        ]);

        Post::create([
            'title' => 'Building a Design System with Tailwind CSS',
            'content' => "# Building a Design System with Tailwind CSS\n\nA design system ensures consistency across your application.\n\n## Custom Colors\n\nDefine your brand colors in `tailwind.config.js`:\n\n```js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: '#3B82F6',\n        secondary: '#10B981',\n      }\n    }\n  }\n}\n```\n\n## Components\n\nCreate reusable components using `@apply` or component libraries like Shadcn UI.",
            'excerpt' => 'How to create a consistent design system using Tailwind CSS custom configuration and component patterns.',
            'status' => 'draft',
        ]);
    }
}
