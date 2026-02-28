'use client';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { MDXContent } from '@/components/mdx-content';
import { TableOfContents } from '@/components/table-of-contents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import GuestLayout from '@/layouts/guest-layout';
import { type Post } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Facebook, Linkedin, Link as LinkIcon, Tag as TagIcon, Twitter } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    post: Post;
    relatedPosts?: Post[];
}

export default function BlogShow({ post, relatedPosts = [] }: Props) {
    const appUrl = import.meta.env.VITE_APP_URL || 'https://aryagading.com';
    const postUrl = `${appUrl}/blog/${post.slug}`;
    // Always use auto-generated OG image as requested
    const featuredImage = `${appUrl}/og/blog/${post.slug}`;

    const formatDate = (date: string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatISODate = (date: string | null) => {
        if (!date) return '';
        return new Date(date).toISOString();
    };

    // Estimate reading time (average 200 words per minute)
    const readingTime = Math.ceil(post.content.split(/\s+/).length / 200);

    // Share functionality
    const shareOnTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`, '_blank');
    };

    const shareOnFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
    };

    const shareOnLinkedIn = () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank');
    };

    const copyLink = async () => {
        await navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
    };

    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt || post.content.substring(0, 160),
        image: featuredImage,
        datePublished: post.published_at ? formatISODate(post.published_at) : undefined,
        dateModified: post.updated_at ? formatISODate(post.updated_at) : undefined,
        author: {
            '@type': 'Person',
            name: 'Arya Gading Prinandika',
            url: appUrl,
        },
        publisher: {
            '@type': 'Person',
            name: 'Arya Gading Prinandika',
            url: appUrl,
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': postUrl,
        },
        wordCount: post.content.split(/\s+/).length,
        keywords: post.tags && post.tags.length > 0 ? post.tags.map((t) => t.name).join(', ') : undefined,
    };

    return (
        <GuestLayout>
            <Head>
                <title>{`${post.title} | Gading Portfolio Blog`}</title>
                <meta name="description" content={post.excerpt || post.content.substring(0, 160)} />
                <meta name="author" content="Arya Gading Prinandika" />
                <link rel="canonical" href={postUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt || post.content.substring(0, 160)} />
                <meta property="og:image" content={featuredImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:url" content={postUrl} />
                <meta property="og:site_name" content="Arya Gading Prinandika" />
                {post.published_at && <meta property="article:published_time" content={formatISODate(post.published_at)} />}
                {post.updated_at && <meta property="article:modified_time" content={formatISODate(post.updated_at)} />}
                <meta property="article:author" content="Arya Gading Prinandika" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt || post.content.substring(0, 160)} />
                <meta name="twitter:image" content={featuredImage} />
                <meta name="twitter:creator" content="@aryagading" />

                {/* JSON-LD Structured Data */}
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Head>

            {/* Table of Contents - Floating sidebar */}
            <TableOfContents content={post.content} />

            <article className="min-h-screen">
                <div className="container mx-auto px-4 py-24">
                    <FadeIn>
                        <Link
                            href="/blog"
                            className="mb-8 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <header className="mx-auto max-w-3xl">
                            <h1 className="font-heading text-3xl leading-tight font-bold md:text-4xl lg:text-5xl">{post.title}</h1>
                            {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>}
                            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(post.published_at)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {readingTime} min read
                                </span>
                            </div>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    {post.tags.map((tag) => (
                                        <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                                            <Badge
                                                variant="secondary"
                                                className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                                            >
                                                {tag.name}
                                            </Badge>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Share buttons */}
                            <div className="mt-6 flex items-center gap-2">
                                <span className="mr-2 text-sm text-muted-foreground">Share:</span>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnTwitter} title="Share on Twitter">
                                    <Twitter className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnFacebook} title="Share on Facebook">
                                    <Facebook className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareOnLinkedIn} title="Share on LinkedIn">
                                    <Linkedin className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyLink} title="Copy link">
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </header>
                    </FadeIn>

                    {(post.featured_image || post.featured_image_url) && (
                        <FadeIn delay={0.2}>
                            <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-xl border border-border">
                                <img
                                    src={post.featured_image ? `/storage/${post.featured_image}` : post.featured_image_url!}
                                    alt={post.title}
                                    className="w-full object-cover"
                                />
                            </div>
                        </FadeIn>
                    )}

                    <FadeIn delay={0.3}>
                        <div className="mx-auto mt-12 max-w-3xl">
                            <MDXContent content={post.content} />
                        </div>
                    </FadeIn>

                    {/* Author section */}
                    <FadeIn delay={0.4}>
                        <div className="mx-auto mt-16 max-w-3xl border-t border-border pt-8">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
                                    <img src="/memoji.png" alt="Author" className="h-full w-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Arya Gading Prinandika</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Full-stack developer passionate about building scalable ecosystems from code to cloud.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Related posts */}
                    {relatedPosts.length > 0 && (
                        <FadeIn delay={0.5}>
                            <div className="mx-auto mt-16 max-w-3xl">
                                <h2 className="mb-6 font-heading text-2xl font-bold">Related Posts</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {relatedPosts.slice(0, 4).map((relatedPost) => (
                                        <Link
                                            key={relatedPost.id}
                                            href={`/blog/${relatedPost.slug}`}
                                            className="group block rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                        >
                                            <h3 className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                                                {relatedPost.title}
                                            </h3>
                                            {relatedPost.excerpt && (
                                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{relatedPost.excerpt}</p>
                                            )}
                                            {relatedPost.tags && relatedPost.tags.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {relatedPost.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag.id} variant="outline" className="px-1.5 py-0 text-xs">
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="mt-3 text-xs text-muted-foreground">{formatDate(relatedPost.published_at)}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    )}

                    <FadeIn delay={0.5}>
                        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
                            <Link href="/blog" className="inline-flex items-center text-sm text-primary hover:underline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                View all posts
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </article>
        </GuestLayout>
    );
}
