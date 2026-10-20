'use client';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { Pagination } from '@/components/pagination';
import { PageHeader } from '@/components/portfolio/page-header';
import { ScrollToTop } from '@/components/portfolio/scroll-to-top';
import { BlogCard } from '@/components/portfolio/sections';
import { EmptyBlock, FilterChip, PageContainer } from '@/components/portfolio/signal';
import { Seo } from '@/components/seo';
import GuestLayout from '@/layouts/guest-layout';
import { type PaginatedData, type Post, type Tag } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

interface Props {
    posts: PaginatedData<Post>;
    tags: Tag[];
    activeTag?: string | null;
}

const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

export default function BlogIndex({ posts, tags, activeTag }: Props) {
    // First post of an unfiltered first page gets the big treatment
    const featured = !activeTag && posts.current_page === 1 ? posts.data[0] : undefined;
    const rest = featured ? posts.data.slice(1) : posts.data;
    const featuredImage = featured && (featured.featured_image ? `/storage/${featured.featured_image}` : featured.featured_image_url);

    return (
        <GuestLayout>
            <Seo title="Blog | Arya Gading Prinandika" description="Thoughts, tutorials, and insights on software development." url="/blog" />
            <ScrollToTop />

            <PageContainer>
                <PageHeader title="Blog" description="Thoughts, tutorials, and insights on software development." />

                {tags.length > 0 && (
                    <FadeIn delay={0.05}>
                        <div className="mb-10 flex flex-wrap items-center gap-2" role="navigation" aria-label="Filter by tag">
                            <FilterChip href="/blog" active={!activeTag}>
                                All
                            </FilterChip>
                            {tags.map((tag) => (
                                <FilterChip key={tag.id} href={`/blog?tag=${tag.slug}`} active={activeTag === tag.slug}>
                                    {tag.name}
                                    {tag.posts_count !== undefined && <span className="opacity-60">{tag.posts_count}</span>}
                                </FilterChip>
                            ))}
                        </div>
                    </FadeIn>
                )}

                {activeTag && (
                    <p className="mb-8 font-mono text-xs tracking-[0.06em] text-muted-foreground">
                        #{activeTag} · {posts.total} post{posts.total !== 1 ? 's' : ''}
                    </p>
                )}

                {posts.data.length > 0 ? (
                    <>
                        {featured && (
                            <FadeIn>
                                <Link
                                    href={`/blog/${featured.slug}`}
                                    className="group mb-6 grid overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary md:grid-cols-2"
                                >
                                    <div className="aspect-video overflow-hidden bg-muted md:aspect-auto md:min-h-80">
                                        {featuredImage && (
                                            <img
                                                src={featuredImage}
                                                alt={featured.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center gap-4 p-8 md:p-12">
                                        <span className="font-mono text-xs tracking-[0.14em] text-primary uppercase">
                                            Latest · {formatDate(featured.published_at)}
                                        </span>
                                        <h2 className="font-heading text-3xl leading-[0.98] font-extrabold tracking-[-0.04em] text-balance md:text-5xl">
                                            {featured.title}
                                        </h2>
                                        {featured.excerpt && <p className="line-clamp-3 text-lg text-muted-foreground">{featured.excerpt}</p>}
                                        <span className="inline-flex items-center gap-1 font-mono text-sm text-primary">
                                            Read post
                                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </span>
                                    </div>
                                </Link>
                            </FadeIn>
                        )}

                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {rest.map((post, index) => (
                                <FadeIn key={post.id} delay={index * 0.08}>
                                    <BlogCard post={post} />
                                </FadeIn>
                            ))}
                        </div>

                        <Pagination paginator={posts} />
                    </>
                ) : (
                    <FadeIn delay={0.2}>
                        <EmptyBlock
                            title={activeTag ? `No posts tagged #${activeTag}` : 'No blog posts yet'}
                            text={activeTag ? 'Try a different tag or browse all posts.' : 'Stay tuned! New articles and tutorials are coming soon.'}
                        />
                    </FadeIn>
                )}
            </PageContainer>
        </GuestLayout>
    );
}
