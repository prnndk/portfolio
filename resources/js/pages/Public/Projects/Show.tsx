'use client';

import { Head, Link } from '@inertiajs/react';

import { ArrowLeft, ExternalLink, Github, Calendar, ImageIcon } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { LinkPreview } from '@/components/ui/link-preview';
import { type Project } from '@/types';
import { Lightbox } from '@/components/ui/lightbox';
import { useState } from 'react';
import { getProjectImage, getProjectGallery } from '@/lib/project-utils';

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
        ? (displayImage.startsWith('http') ? displayImage : `${appUrl}${displayImage}`)
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
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Head>

            <article className="min-h-screen">
                <div className="container mx-auto px-4 py-24">
                    <FadeIn>
                        <Link
                            href="/projects"
                            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Projects
                        </Link>
                    </FadeIn>

                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Image */}
                        <FadeIn delay={0.1}>
                            <div className="overflow-hidden rounded-xl border border-border">
                                {displayImage ? (
                                    <img
                                        src={displayImage}
                                        alt={project.title}
                                        className="w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex aspect-video items-center justify-center bg-muted">
                                        <span className="text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </div>
                        </FadeIn>

                        {/* Content */}
                        <FadeIn delay={0.2}>
                            <div>
                                <h1 className="font-heading text-3xl font-bold md:text-4xl">
                                    {project.title}
                                </h1>

                                {project.featured && (
                                    <Badge className="mt-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                        Featured Project
                                    </Badge>
                                )}

                                <p className="mt-4 text-lg text-muted-foreground">
                                    {project.description}
                                </p>

                                {project.tech_tags && project.tech_tags.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                                            Tech Stack
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tech_tags.map((tag) => (
                                                <Badge key={tag} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex flex-wrap gap-4">
                                    {project.url && (
                                        <LinkPreview url={project.url} className={buttonVariants({ variant: 'default' })}>
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            View Live
                                        </LinkPreview>
                                    )}
                                    {project.github_url && (
                                        <Button variant="outline" asChild>
                                            <a
                                                href={project.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Github className="mr-2 h-4 w-4" />
                                                View Source
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Added {new Date(project.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {allGallery.length > 0 && (
                        <FadeIn delay={0.3}>
                            <div className="mt-16">
                                <h2 className="mb-6 font-heading text-2xl font-bold">Project Gallery</h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                                    {allGallery.map((image, index) => (
                                        <div
                                            key={index}
                                            className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-border bg-muted transition-all hover:shadow-lg"
                                            onClick={() => openLightbox(index)}
                                        >
                                            <img
                                                src={image}
                                                alt={`${project.title} gallery ${index + 1}`}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                <ImageIcon className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    )}

                    <Lightbox
                        isOpen={lightboxOpen}
                        onClose={() => setLightboxOpen(false)}
                        images={allGallery}
                        initialIndex={currentImageIndex}
                    />

                </div>
            </article>
        </GuestLayout>
    );
}
