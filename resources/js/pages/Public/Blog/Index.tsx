'use client';

import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { BlogCard } from '@/components/portfolio/sections';
import { type Post } from '@/types';

interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    posts: PaginatedPosts;
}

export default function BlogIndex({ posts }: Props) {
    return (
        <GuestLayout>
            <Head title="Blog" />

            <div className="min-h-screen pt-24">
                <div className="container mx-auto px-4 py-12">
                    <FadeIn>
                        <Link
                            href="/"
                            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>

                        <h1 className="font-heading text-4xl font-bold md:text-5xl">Blog</h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            Thoughts, tutorials, and insights
                        </p>
                    </FadeIn>

                    {posts.data.length > 0 ? (
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((post, index) => (
                                <FadeIn key={post.id} delay={index * 0.1}>
                                    <BlogCard post={post} />
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
                            <p className="text-muted-foreground">
                                No blog posts yet. Check back soon!
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {posts.last_page > 1 && (
                        <div className="mt-12 flex justify-center gap-2">
                            {posts.prev_page_url && (
                                <Link
                                    href={posts.prev_page_url}
                                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                                >
                                    Previous
                                </Link>
                            )}
                            <span className="px-4 py-2 text-sm text-muted-foreground">
                                Page {posts.current_page} of {posts.last_page}
                            </span>
                            {posts.next_page_url && (
                                <Link
                                    href={posts.next_page_url}
                                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
