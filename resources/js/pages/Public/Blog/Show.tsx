'use client';

import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { type Post } from '@/types';
import { MDXContent } from '@/components/mdx-content';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
    post: Post;
    relatedPosts?: Post[];
}

export default function BlogShow({ post, relatedPosts = [] }: Props) {
    const appUrl = import.meta.env.VITE_APP_URL || 'https://aryagading.com';
    const postUrl = `${appUrl}/blog/${post.slug}`;
    // Use featured image if available, otherwise use auto-generated OG image
    const featuredImage = post.featured_image
        ? `${appUrl}/storage/${post.featured_image}`
        : `${appUrl}/og/blog/${post.slug}`;

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
    };

    return (
        <GuestLayout>
            {/* Enhanced SEO Head */}
            <Head>
                <title>{`${post.title} | Blog`}</title>
                <meta name="description" content={post.excerpt || post.content.substring(0, 160)} />
                <meta name="author" content="Arya Gading Prinandika" />
                <link rel="canonical" href={postUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt || post.content.substring(0, 160)} />
                <meta property="og:image" content={featuredImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:url" content={postUrl} />
                <meta property="og:site_name" content="Arya Gading Prinandika" />
                {post.published_at && (
                    <meta property="article:published_time" content={formatISODate(post.published_at)} />
                )}
                {post.updated_at && (
                    <meta property="article:modified_time" content={formatISODate(post.updated_at)} />
                )}
                <meta property="article:author" content="Arya Gading Prinandika" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt || post.content.substring(0, 160)} />
                <meta name="twitter:image" content={featuredImage} />
                <meta name="twitter:creator" content="@aryagading" />

                {/* JSON-LD Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Head>

            <article className="min-h-screen">
                <div className="container mx-auto px-4 py-24">
                    <FadeIn>
                        <Link
                            href="/blog"
                            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <header className="mx-auto max-w-3xl">
                            <h1 className="font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                                {post.title}
                            </h1>
                            {post.excerpt && (
                                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                    {post.excerpt}
                                </p>
                            )}
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

                            {/* Share buttons */}
                            <div className="mt-6 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground mr-2">Share:</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={shareOnTwitter}
                                    title="Share on Twitter"
                                >
                                    <Twitter className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={shareOnFacebook}
                                    title="Share on Facebook"
                                >
                                    <Facebook className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={shareOnLinkedIn}
                                    title="Share on LinkedIn"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={copyLink}
                                    title="Copy link"
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </header>
                    </FadeIn>

                    {post.featured_image && (
                        <FadeIn delay={0.2}>
                            <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-xl border border-border">
                                <img
                                    src={`/storage/${post.featured_image}`}
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
                                    <img
                                        src="/memoji.png"
                                        alt="Author"
                                        className="h-full w-full object-cover"
                                    />
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
                                <h2 className="font-heading text-2xl font-bold mb-6">Related Posts</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {relatedPosts.slice(0, 2).map((relatedPost) => (
                                        <Link
                                            key={relatedPost.id}
                                            href={`/blog/${relatedPost.slug}`}
                                            className="group block rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                        >
                                            <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                                {relatedPost.title}
                                            </h3>
                                            {relatedPost.excerpt && (
                                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                                    {relatedPost.excerpt}
                                                </p>
                                            )}
                                            <p className="mt-3 text-xs text-muted-foreground">
                                                {formatDate(relatedPost.published_at)}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    )}

                    <FadeIn delay={0.5}>
                        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
                            <Link
                                href="/blog"
                                className="inline-flex items-center text-sm text-primary hover:underline"
                            >
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
