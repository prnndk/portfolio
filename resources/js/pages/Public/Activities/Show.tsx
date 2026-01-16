'use client';

import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Building2, ImageIcon } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { type Activity } from '@/types';
import { Lightbox } from '@/components/ui/lightbox';
import { Seo } from '@/components/seo';
import { useState } from 'react';

interface Props {
    activity: Activity;
}

export default function ActivityShow({ activity }: Props) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const formatDate = (date: string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
        });
    };

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

            <article className="min-h-screen">
                <div className="container mx-auto px-4 py-24">
                    <FadeIn>
                        <Link
                            href="/activities"
                            className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Activities
                        </Link>
                    </FadeIn>

                    <div className="mx-auto max-w-3xl">
                        <FadeIn delay={0.1}>
                            <h1 className="font-heading text-3xl font-bold md:text-4xl">
                                {activity.title}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                                {activity.role && (
                                    <span className="text-lg text-primary">{activity.role}</span>
                                )}
                                {activity.organization && (
                                    <span className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        {activity.organization}
                                    </span>
                                )}
                            </div>

                            {activity.start_date && (
                                <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(activity.start_date)}
                                    {activity.end_date
                                        ? ` - ${formatDate(activity.end_date)}`
                                        : ' - Present'}
                                </div>
                            )}
                        </FadeIn>

                        {activity.description && (
                            <FadeIn delay={0.2}>
                                <div className="mt-8">
                                    <h2 className="mb-4 font-heading text-xl font-semibold">
                                        Description
                                    </h2>
                                    <p className="whitespace-pre-wrap text-muted-foreground">
                                        {activity.description}
                                    </p>
                                </div>
                            </FadeIn>
                        )}

                        {activity.gallery && activity.gallery.length > 0 && (
                            <FadeIn delay={0.3}>
                                <div className="mt-8">
                                    <h2 className="mb-4 font-heading text-xl font-semibold">
                                        <ImageIcon className="mr-2 inline h-5 w-5" />
                                        Gallery
                                    </h2>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {activity.gallery.map((image, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.02 }}
                                                className="cursor-pointer overflow-hidden rounded-lg border border-border"
                                                onClick={() => openLightbox(index)}
                                            >
                                                <img
                                                    src={`/storage/${image}`}
                                                    alt={`${activity.title} gallery ${index + 1}`}
                                                    className="aspect-video w-full object-cover"
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </FadeIn>
                        )}
                    </div>
                </div>
            </article>

            {activity.gallery && (
                <Lightbox
                    images={activity.gallery.map(img => `/storage/${img}`)}
                    initialIndex={currentImageIndex}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </GuestLayout>
    );
}
