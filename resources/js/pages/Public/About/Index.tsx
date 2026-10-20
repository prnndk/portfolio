'use client';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { Mascot } from '@/components/portfolio/mascot';
import { Container, MagneticLink, SectionHeader, TiltCard } from '@/components/portfolio/signal';
import { Seo } from '@/components/seo';
import { DraggableCardBody, DraggableCardContainer } from '@/components/ui/draggable-card';
import { Lightbox } from '@/components/ui/lightbox';
import GuestLayout from '@/layouts/guest-layout';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, BookOpen, Code2, Coffee, Download, Gamepad2, Layers, MapPin, Music, Server } from 'lucide-react';
import { useRef, useState } from 'react';

// Journey type from backend
interface Journey {
    id: number;
    title: string;
    subtitle: string | null;
    organization: string | null;
    type: 'work' | 'education' | 'achievement' | 'other';
    description: string | null;
    skills: string[] | null;
    logo_display_url: string | null;
    all_gallery_images: { url: string; type: 'uploaded' | 'url'; path: string | null }[];
    start_date: string | null;
    end_date: string | null;
}

interface Props {
    journeys: Journey[];
}

const strong = 'font-semibold text-foreground';

const expertise = [
    {
        icon: Layers,
        title: 'Full Stack Development',
        text: 'Building comprehensive web and mobile solutions. I craft interactive interfaces using React/Next.js and integrate them with powerful backends like Laravel and Node.js.',
    },
    {
        icon: Code2,
        title: 'Backend Engineering',
        text: 'Designing scalable logic and REST APIs. My focus is on performance and data efficiency using Python, Go, and Node.js, ensuring applications run smoothly under load.',
    },
    {
        icon: Server,
        title: 'DevOps & Infrastructure',
        text: 'Bridging development and operations. I manage server deployments using Docker, Nginx, and Linux automation to create secure and reliable production environments.',
    },
];

const beyond = [
    { icon: Coffee, title: 'Coffee lover', text: 'Fuel for late-night coding sessions' },
    { icon: Gamepad2, title: 'Gamer', text: "Cities Skylines, Assassin's Creed, Football Manager and many more" },
    { icon: BookOpen, title: 'Learner', text: 'Always exploring new technologies' },
    { icon: Music, title: 'Music fan', text: 'Coldplay, Sheila on 7, and more' },
];

const links = [
    { label: 'Email', handle: 'me@aryagading.com', href: 'mailto:me@aryagading.com' },
    { label: 'GitHub', handle: '@prnndk', href: 'https://github.com/prnndk' },
    { label: 'LinkedIn', handle: 'Arya Gading', href: 'https://linkedin.com/in/aryagading' },
    { label: 'Instagram', handle: '@gadingprinandika', href: 'https://instagram.com/gadingprinandika' },
];

const formatMonth = (date: string | null) => (date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null);

/** Draggable photo card. Drag it around inside the hero. */
function Polaroid({
    imageUrl,
    label,
    rotation,
    constraintRef,
}: {
    imageUrl: string;
    label: string;
    rotation: string;
    constraintRef: React.RefObject<Element | null>;
}) {
    return (
        <DraggableCardContainer>
            <DraggableCardBody
                constraintRef={constraintRef}
                className={cn('flex min-h-[320px] w-60 flex-col justify-between rounded-2xl border border-border bg-card p-3 shadow-xl', rotation)}
            >
                <div className="relative h-60 w-full overflow-hidden rounded-xl bg-muted">
                    <img
                        src={imageUrl}
                        alt={label}
                        draggable={false}
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none"
                    />
                </div>
                <p className="pt-3 pb-1 text-center font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
            </DraggableCardBody>
        </DraggableCardContainer>
    );
}

function JourneyEntry({ journey, onGalleryClick }: { journey: Journey; onGalleryClick: (images: string[], index: number) => void }) {
    const gallery = journey.all_gallery_images.map((img) => img.url);
    const from = formatMonth(journey.start_date);

    return (
        <div className="grid gap-4 border-b border-border py-10 sm:grid-cols-[160px_1fr] sm:gap-10">
            <div className="flex flex-col gap-1">
                <span className="font-heading text-4xl font-extrabold tracking-[-0.05em] text-primary">
                    {journey.start_date ? new Date(journey.start_date).getFullYear() : 'Now'}
                </span>
                {from && (
                    <span className="font-mono text-xs text-muted-foreground">
                        {from} – {journey.end_date ? formatMonth(journey.end_date) : 'Present'}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    {journey.logo_display_url && (
                        <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                            <img
                                src={journey.logo_display_url}
                                alt={journey.organization || journey.title}
                                className="h-full w-full object-contain p-1.5"
                            />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h3 className="font-heading text-2xl font-bold tracking-[-0.03em]">{journey.title}</h3>
                        {(journey.subtitle || journey.organization) && (
                            <p className="text-muted-foreground">{[journey.subtitle, journey.organization].filter(Boolean).join(' · ')}</p>
                        )}
                    </div>
                </div>

                {journey.description && <p className="max-w-2xl leading-relaxed text-pretty text-muted-foreground">{journey.description}</p>}

                {journey.skills && journey.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {journey.skills.map((skill) => (
                            <span key={skill} className="rounded-full border border-border px-3 py-1 font-mono text-xs">
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {gallery.length > 0 && (
                    <div className="grid max-w-xl grid-cols-4 gap-2">
                        {gallery.slice(0, 4).map((url, i) => (
                            <button
                                key={url}
                                type="button"
                                onClick={() => onGalleryClick(gallery, i)}
                                aria-label={`Open photo ${i + 1} of ${journey.title}`}
                                className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary"
                            >
                                <img
                                    src={url}
                                    alt=""
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                {i === 3 && gallery.length > 4 && (
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 font-semibold text-white">
                                        +{gallery.length - 4}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function About({ journeys }: Props) {
    const containerRef = useRef<HTMLElement>(null);
    const [lightbox, setLightbox] = useState<{ open: boolean; images: string[]; index: number }>({ open: false, images: [], index: 0 });
    const openLightbox = (images: string[], index: number) => setLightbox({ open: true, images, index });

    return (
        <GuestLayout>
            <Seo
                title="About Me | Portfolio Arya Gading Prinandika"
                description="Learn more about Arya Gading Prinandika - a passionate software engineer specializing in modern web development."
            />

            {/* Hero */}
            <section ref={containerRef} className="relative overflow-hidden pt-28 pb-20 md:pt-36">
                <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
                    <div className="relative mx-auto h-[420px] w-full max-w-md lg:h-[500px]">
                        <p className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.14em] whitespace-nowrap text-muted-foreground uppercase">
                            Drag the cards around
                        </p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                            animate={{ opacity: 1, scale: 1, rotate: -8 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="absolute top-0 left-2 z-10 md:left-0"
                        >
                            <Polaroid imageUrl="/profile.jpg" label="Capturing moments" rotation="rotate-[-8deg]" constraintRef={containerRef} />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1, rotate: 3 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="absolute top-12 left-1/2 z-20 -translate-x-1/2 md:top-16 md:left-24 md:translate-x-0"
                        >
                            <Polaroid imageUrl="/profile.jpg" label="Building things" rotation="rotate-[3deg]" constraintRef={containerRef} />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 6 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="absolute top-24 right-2 z-30 md:top-32 md:right-0"
                        >
                            <Polaroid imageUrl="/profile.jpg" label="Creating magic" rotation="rotate-[6deg]" constraintRef={containerRef} />
                        </motion.div>
                    </div>

                    <div className="flex [animation:var(--animate-fade-up)] flex-col gap-6">
                        <span className="section-index">
                            <span className="text-primary">00 / </span>About
                        </span>
                        <h1 className="font-heading text-[clamp(3rem,7vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.06em] text-balance">
                            I&apos;m Arya Gading&nbsp;P<span className="text-primary">.</span>
                        </h1>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            Hi, I&apos;m <strong className={strong}>Arya</strong>. I am a passionate{' '}
                            <strong className={strong}>Developer and Student</strong> based in <strong className={strong}>Indonesia</strong> who loves
                            challenges and learning new things.
                        </p>
                        <p className="leading-relaxed text-muted-foreground">
                            I specialize in building <strong className={strong}>Web and Mobile Applications</strong> using modern tech stacks, with
                            additional expertise in <strong className={strong}>DevOps and Cloud Infrastructure</strong>. Just like normal human, i
                            like playing games, listening to music, and watching movies when i&apos;m not coding.
                        </p>
                        <div className="flex flex-wrap gap-2 font-mono text-xs">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                Indonesia
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                                <Code2 className="h-3.5 w-3.5 text-primary" />
                                3+ years experience
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <MagneticLink
                                href="/contact"
                                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-shadow hover:shadow-lg hover:shadow-primary/30"
                            >
                                Get in touch
                                <ArrowRight className="h-4 w-4" />
                            </MagneticLink>
                            <a
                                href="/resume.pdf"
                                download
                                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-6 font-semibold transition-colors hover:border-primary hover:text-primary"
                            >
                                <Download className="h-4 w-4" />
                                Download CV
                            </a>
                        </div>
                    </div>
                </Container>
            </section>

            {/* What I do */}
            <section className="border-t border-border py-24 md:py-32">
                <Container>
                    <FadeIn>
                        <SectionHeader index="01" label="Expertise" title="What I do" className="mb-6" />
                        <p className="mb-12 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
                            As a <span className="font-semibold text-primary">University Student &amp; Developer</span>, I bridge the gap between
                            academic theory and real-world application. I love exploring new technologies to build robust software, from concept to
                            deployment.
                        </p>
                    </FadeIn>
                    <div className="grid gap-5 md:grid-cols-3">
                        {expertise.map(({ icon: Icon, title, text }, i) => (
                            <FadeIn key={title} delay={i * 0.1}>
                                <TiltCard max={5} className="h-full">
                                    <div className="flex h-full flex-col gap-4 rounded-3xl border border-border bg-card p-8 transition-colors hover:border-primary">
                                        <div className="flex items-center justify-between">
                                            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                <Icon className="h-6 w-6" />
                                            </span>
                                            <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                                        </div>
                                        <h3 className="font-heading text-2xl font-bold tracking-[-0.03em]">{title}</h3>
                                        <p className="leading-relaxed text-muted-foreground">{text}</p>
                                    </div>
                                </TiltCard>
                            </FadeIn>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Journey */}
            <section className="border-t border-border py-24 md:py-32">
                <Container>
                    <FadeIn>
                        <SectionHeader index="02" label="Journey" title="How my story unfolded" className="mb-6" />
                        <p className="mb-8 max-w-2xl text-lg text-pretty text-muted-foreground">
                            From curious beginner to building production-grade applications.
                        </p>
                    </FadeIn>
                    {journeys.length > 0 ? (
                        <div className="border-t border-border">
                            {journeys.map((journey) => (
                                <FadeIn key={journey.id}>
                                    <JourneyEntry journey={journey} onGalleryClick={openLightbox} />
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border p-12 text-center">
                            <Mascot pose="coding" follow={false} className="h-28 w-24" />
                            <p className="text-muted-foreground">My journey will appear here once it&apos;s added from the dashboard.</p>
                        </div>
                    )}
                </Container>
            </section>

            {/* Beyond the code */}
            <section className="border-t border-border py-24 md:py-32">
                <Container>
                    <FadeIn>
                        <SectionHeader index="03" label="Off the clock" title="Beyond the code" />
                    </FadeIn>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {beyond.map(({ icon: Icon, title, text }, i) => (
                            <FadeIn key={title} delay={i * 0.08}>
                                <div className="flex h-full min-h-48 flex-col gap-3 rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary">
                                    <Icon className="h-7 w-7 text-primary" />
                                    <h3 className="mt-auto font-heading text-xl font-bold tracking-[-0.02em]">{title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Connect */}
            <section className="border-t border-border py-24 md:py-32">
                <Container className="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
                    <FadeIn>
                        <SectionHeader index="04" label="Connect" title="Let's connect" className="mb-6" />
                        <p className="max-w-md text-lg leading-relaxed text-pretty text-muted-foreground">
                            Whether you have a project in mind, want to discuss opportunities, or just want to say hi — I&apos;d love to hear from
                            you!
                        </p>
                        <Mascot pose="wave" className="mt-8 hidden h-56 w-48 lg:block" />
                    </FadeIn>
                    <div className="border-t border-border">
                        {links.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target={link.href.startsWith('http') ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                className="group grid items-center gap-2 border-b border-border py-6 transition-all hover:bg-card sm:grid-cols-[140px_1fr_auto] sm:gap-6 sm:hover:px-4"
                            >
                                <span className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">{link.label}</span>
                                <span className="font-heading text-xl font-semibold tracking-[-0.02em] md:text-2xl">{link.handle}</span>
                                <ArrowUpRight className="hidden h-6 w-6 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:block" />
                            </a>
                        ))}
                        <Link
                            href="/contact"
                            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
                        >
                            Or use the contact form
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </Container>
            </section>

            <Lightbox
                images={lightbox.images}
                initialIndex={lightbox.index}
                isOpen={lightbox.open}
                onClose={() => setLightbox((s) => ({ ...s, open: false }))}
            />
        </GuestLayout>
    );
}
