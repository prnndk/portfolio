'use client';

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { BlogCard } from '@/components/portfolio/sections';
import { Button } from '@/components/ui/button';
import { type Post } from '@/types';
import { Seo } from '@/components/seo';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';

interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    posts: PaginatedPosts;
}

export default function BlogIndex({ posts }: Props) {
    return (
        <GuestLayout>
            <Seo
                title="Blog | Arya Gading Prinandika"
                description="Thoughts, tutorials, and insights on software development."
                url="/blog"
            />


            <div className="container mx-auto px-4 py-24">
                <FadeIn>
                    <div className="mb-12">
                        <Link
                            href="/"
                            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="font-heading text-4xl font-bold md:text-5xl">
                            Blog
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                            Thoughts, tutorials, and insights on software development.
                        </p>
                    </div>
                </FadeIn>

                {posts.data.length > 0 ? (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((post, index) => (
                                <FadeIn key={post.id} delay={index * 0.1}>
                                    <BlogCard post={post} />
                                </FadeIn>
                            ))}
                        </div>

                        {/* Pagination */}
                        {posts.last_page > 1 && posts.links && (
                            <div className="mt-12 flex justify-center gap-2">
                                {posts.links.map((link, i) => {
                                    if (link.url === null) return null;
                                    const isPrev = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');

                                    if (isPrev || isNext) {
                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="icon"
                                                asChild
                                                disabled={!link.url}
                                            >
                                                <Link href={link.url}>
                                                    {isPrev ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                                </Link>
                                            </Button>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            asChild
                                        >
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <FadeIn delay={0.2}>
                        <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FileText className="h-6 w-6" />
                                    </EmptyMedia>
                                    <EmptyTitle>No blog posts yet</EmptyTitle>
                                    <EmptyDescription>
                                        Stay tuned! New articles and tutorials are coming soon.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    </FadeIn>
                )}
            </div>
        </GuestLayout>
    );
}
