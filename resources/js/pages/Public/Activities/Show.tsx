'use client';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { PageContainer } from '@/components/portfolio/signal';
import { Seo } from '@/components/seo';
import { Lightbox } from '@/components/ui/lightbox';
import GuestLayout from '@/layouts/guest-layout';
import { type Activity } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Calendar } from 'lucide-react';
import { useState } from 'react';

interface Props {
    activity: Activity;
}

const formatDate = (date: string | null) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '');

export default function ActivityShow({ activity }: Props) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    return (
        <GuestLayout>
            <Seo
                title={activity.title}
                description={activity.description || undefined}
                image={activity.gallery && activity.gallery.length > 0 ? `/storage/${activity.gallery[0]}` : undefined}
            />

            <article>
                <PageContainer>
                    <FadeIn>
                        <Link
                            href="/activities"
                            className="mb-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Activities
                        </Link>
                    </FadeIn>

                    <div className="mx-auto max-w-3xl">
                        <FadeIn delay={0.1}>
                            <h1 className="font-heading text-5xl leading-[0.95] font-extrabold tracking-[-0.05em] text-balance md:text-6xl">
                                {activity.title}
                                <span className="text-primary">.</span>
                            </h1>

                            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                                {activity.role && <span className="font-heading text-xl font-semibold text-primary">{activity.role}</span>}
                                {activity.organization && (
                                    <span className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        {activity.organization}
                                    </span>
                                )}
                                {activity.start_date && (
                                    <span className="flex items-center gap-2 font-mono text-sm">
                                        <Calendar className="h-4 w-4" />
                                        {formatDate(activity.start_date)} – {activity.end_date ? formatDate(activity.end_date) : 'Present'}
                                    </span>
                                )}
                            </div>
                        </FadeIn>

                        {activity.description && (
                            <FadeIn delay={0.2}>
                                <p className="mt-10 text-lg leading-relaxed whitespace-pre-wrap text-muted-foreground">{activity.description}</p>
                            </FadeIn>
                        )}
                    </div>

                    {activity.gallery && activity.gallery.length > 0 && (
                        <FadeIn delay={0.3}>
                            <div className="mt-16">
                                <span className="section-index">Gallery</span>
                                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {activity.gallery.map((image, index) => (
                                        <button
                                            key={image}
                                            type="button"
                                            aria-label={`Open photo ${index + 1}`}
                                            onClick={() => openLightbox(index)}
                                            className="group overflow-hidden rounded-2xl border border-border bg-muted transition-colors hover:border-primary"
                                        >
                                            <img
                                                src={`/storage/${image}`}
                                                alt={`${activity.title} gallery ${index + 1}`}
                                                loading="lazy"
                                                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </FadeIn>
                    )}
                </PageContainer>
            </article>

            {activity.gallery && (
                <Lightbox
                    images={activity.gallery.map((img) => `/storage/${img}`)}
                    initialIndex={currentImageIndex}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </GuestLayout>
    );
}
