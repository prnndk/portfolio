'use client';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { Pagination } from '@/components/pagination';
import { PageHeader } from '@/components/portfolio/page-header';
import { BlogCard } from '@/components/portfolio/sections';
import { Seo } from '@/components/seo';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import GuestLayout from '@/layouts/guest-layout';
import { type PaginatedData, type Post, type Tag } from '@/types';
import { Link } from '@inertiajs/react';
import { FileText, Tag as TagIcon, X } from 'lucide-react';

interface Props {
    posts: PaginatedData<Post>;
    tags: Tag[];
    activeTag?: string | null;
}

export default function BlogIndex({ posts, tags, activeTag }: Props) {
    return (
        <GuestLayout>
            <Seo title="Blog | Arya Gading Prinandika" description="Thoughts, tutorials, and insights on software development." url="/blog" />

            <div className="container mx-auto px-4 py-24">
                <PageHeader title="Blog" description="Thoughts, tutorials, and insights on software development." />

                {/* Tag filter pills */}
                {tags.length > 0 && (
                    <FadeIn delay={0.05}>
                        <div className="mb-8 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <TagIcon className="h-3.5 w-3.5" />
                                Filter:
                            </span>
                            <Link href="/blog">
                                <Badge
                                    variant={!activeTag ? 'default' : 'outline'}
                                    className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                                >
                                    All
                                </Badge>
                            </Link>
                            {tags.map((tag) => (
                                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                                    <Badge
                                        variant={activeTag === tag.slug ? 'default' : 'outline'}
                                        className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                                    >
                                        {tag.name}
                                        {tag.posts_count !== undefined && <span className="ml-1 opacity-60">({tag.posts_count})</span>}
                                    </Badge>
                                </Link>
                            ))}
                            {activeTag && (
                                <Link
                                    href="/blog"
                                    className="ml-1 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                                >
                                    <X className="h-3 w-3" />
                                    Clear filter
                                </Link>
                            )}
                        </div>
                    </FadeIn>
                )}

                {activeTag && (
                    <FadeIn delay={0.08}>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Showing posts tagged <span className="font-medium text-foreground">#{activeTag}</span>
                            {' — '}
                            <span>
                                {posts.total} post{posts.total !== 1 ? 's' : ''}
                            </span>
                        </p>
                    </FadeIn>
                )}

                {posts.data.length > 0 ? (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((post, index) => (
                                <FadeIn key={post.id} delay={index * 0.1}>
                                    <BlogCard post={post} />
                                </FadeIn>
                            ))}
                        </div>

                        <Pagination paginator={posts} />
                    </>
                ) : (
                    <FadeIn delay={0.2}>
                        <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <FileText className="h-6 w-6" />
                                    </EmptyMedia>
                                    <EmptyTitle>{activeTag ? `No posts tagged #${activeTag}` : 'No blog posts yet'}</EmptyTitle>
                                    <EmptyDescription>
                                        {activeTag
                                            ? 'Try a different tag or browse all posts.'
                                            : 'Stay tuned! New articles and tutorials are coming soon.'}
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
