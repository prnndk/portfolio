'use client';

import { Head, Link } from '@inertiajs/react';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { PageContainer } from '@/components/portfolio/signal';
import { Lightbox } from '@/components/ui/lightbox';
import { LinkPreview } from '@/components/ui/link-preview';
import GuestLayout from '@/layouts/guest-layout';
import { getProjectGallery, getProjectImage } from '@/lib/project-utils';
import { type Project } from '@/types';
import { ArrowLeft, Calendar, ExternalLink, Github, ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface Props {
    project: Project;
}

export default function ProjectShow({ project }: Props) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const appUrl = import.meta.env.VITE_APP_URL || 'https://aryagading.com';
    const projectUrl = `${appUrl}/projects/${project.slug}`;
    // Use project image if available, otherwise use auto-generated OG image
    const displayImage = getProjectImage(project);
    const ogImage = displayImage
        ? displayImage.startsWith('http')
            ? displayImage
            : `${appUrl}${displayImage}`
        : `${appUrl}/og/project/${project.slug}`;

    // Get all gallery images (uploaded + URLs)
    const allGallery = getProjectGallery(project);

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    // JSON-LD structured data for SEO
    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description: project.description,
        image: ogImage,
        author: {
            '@type': 'Person',
            name: 'Arya Gading Prinandika',
            url: appUrl,
        },
        url: projectUrl,
    };

    if (project.url) {
        jsonLd.mainEntityOfPage = project.url;
    }
    if (project.github_url) {
        jsonLd.codeRepository = project.github_url;
    }
    if (project.tech_tags && project.tech_tags.length > 0) {
        jsonLd.keywords = project.tech_tags.join(', ');
    }

    return (
        <GuestLayout>
            {/* Enhanced SEO Head */}
            <Head>
                <title>{`${project.title} | Gading Portfolio Projects`}</title>
                <meta name="description" content={project.description} />
                <meta name="author" content="Arya Gading Prinandika" />
                <link rel="canonical" href={projectUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="en_US" />
                <meta property="og:title" content={project.title} />
                <meta property="og:description" content={project.description} />
                <meta property="og:image" content={ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:url" content={projectUrl} />
                <meta property="og:site_name" content="Arya Gading Prinandika" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={project.title} />
                <meta name="twitter:description" content={project.description} />
                <meta name="twitter:image" content={ogImage} />
                <meta name="twitter:creator" content="@aryagading" />

                {/* JSON-LD Structured Data */}
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Head>

            <article>
                <PageContainer>
                    <FadeIn>
                        <Link
                            href="/projects"
                            className="mb-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Projects
                        </Link>
                    </FadeIn>

                    <FadeIn delay={0.05}>
                        <div className="flex flex-col gap-4">
                            {project.featured && <span className="section-index text-primary">Featured project</span>}
                            <h1 className="font-heading text-5xl leading-[0.95] font-extrabold tracking-[-0.05em] text-balance md:text-7xl">
                                {project.title}
                                <span className="text-primary">.</span>
                            </h1>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.1}>
                        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-muted">
                            {displayImage ? (
                                <img src={displayImage} alt={project.title} className="max-h-[640px] w-full object-cover" />
                            ) : (
                                <div className="flex aspect-video items-center justify-center text-muted-foreground">No image</div>
                            )}
                        </div>
                    </FadeIn>

                    <div className="mt-12 grid gap-12 lg:grid-cols-[2fr_1fr]">
                        <FadeIn delay={0.15}>
                            <p className="text-xl leading-relaxed text-pretty text-muted-foreground md:text-2xl">{project.description}</p>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <div className="flex flex-col gap-8 border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                                {project.tech_tags && project.tech_tags.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <span className="section-index">Tech stack</span>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tech_tags.map((tag) => (
                                                <span key={tag} className="rounded-full border border-border px-3 py-1 font-mono text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    {project.url && (
                                        <LinkPreview
                                            url={project.url}
                                            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-shadow hover:shadow-lg hover:shadow-primary/30"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            View live
                                        </LinkPreview>
                                    )}
                                    {project.github_url && (
                                        <a
                                            href={project.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-6 font-semibold transition-colors hover:border-primary hover:text-primary"
                                        >
                                            <Github className="h-4 w-4" />
                                            View source
                                        </a>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Added{' '}
                                    {new Date(project.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {allGallery.length > 0 && (
                        <FadeIn delay={0.25}>
                            <div className="mt-20">
                                <span className="section-index">Gallery</span>
                                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                                    {allGallery.map((image, index) => (
                                        <button
                                            key={image}
                                            type="button"
                                            aria-label={`Open image ${index + 1}`}
                                            className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted transition-colors hover:border-primary"
                                            onClick={() => openLightbox(index)}
                                        >
                                            <img
                                                src={image}
                                                alt={`${project.title} gallery ${index + 1}`}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                <ImageIcon className="h-8 w-8 text-white" />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    )}

                    <Lightbox isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} images={allGallery} initialIndex={currentImageIndex} />
                </PageContainer>
            </article>
        </GuestLayout>
    );
}
