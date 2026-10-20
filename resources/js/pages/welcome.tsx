'use client';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { Mascot } from '@/components/portfolio/mascot';
import { Container, MagneticLink, Marquee, SectionHeader, TiltCard } from '@/components/portfolio/signal';
import { TypedCycle } from '@/components/portfolio/typed-cycle';
import { Seo } from '@/components/seo';
import GuestLayout from '@/layouts/guest-layout';
import { getProjectImage } from '@/lib/project-utils';
import { cn } from '@/lib/utils';
import { type Activity, type Favorite, type Post, type Project, type TechStack } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, BookOpen, Film, Github, Instagram, Linkedin, Mail, Music } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';

// three.js is only fetched in the browser, after hydration
const HeroScene = lazy(() => import('@/components/portfolio/hero-scene'));

interface Props {
    projects?: Project[];
    activities?: Activity[];
    posts?: Post[];
    techStacks?: TechStack[];
    favorites?: Favorite[];
}

const words = ['Web Applications', 'Mobile Apps', 'Infrastructure', 'AI Integration', 'System Architecture', 'Business Solutions'];

const socials = [
    { label: 'GitHub', href: 'https://github.com/prnndk', icon: Github },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/aryagading', icon: Linkedin },
    { label: 'Instagram', href: 'https://instagram.com/gadingprinandika', icon: Instagram },
    { label: 'Email', href: 'mailto:me@aryagading.com', icon: Mail },
];

const tools = [
    { label: 'Image compress', href: '/tools/image-compress' },
    { label: 'JPG → PDF', href: '/tools/jpg-to-pdf' },
    { label: 'PDF merge', href: '/tools/pdf-merge' },
    { label: 'PDF split', href: '/tools/pdf-split' },
    { label: 'PDF → images', href: '/tools/pdf-to-images' },
    { label: 'PDF compress', href: '/tools/pdf-compress' },
    { label: 'PDF rotate', href: '/tools/pdf-rotate' },
];

// Bento rhythm for the 12-column work grid
const workSpans = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7', 'lg:col-span-6', 'lg:col-span-6'];

const favoriteIcon = { movie: Film, music: Music, book: BookOpen };

const formatMonth = (date: string | null) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '');

function useWebGL() {
    const [ok, setOk] = useState(false);
    useEffect(() => {
        setOk(!!document.createElement('canvas').getContext('webgl2'));
    }, []);
    return ok;
}

function EmptyBlock({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border p-12 text-center">
            <Mascot pose="lost" follow={false} className="h-28 w-24" />
            <p className="text-muted-foreground">{text}</p>
        </div>
    );
}

export default function Welcome({ projects = [], activities = [], posts = [], techStacks = [], favorites = [] }: Props) {
    const webgl = useWebGL();
    const stackGroups = Object.entries(
        techStacks.reduce<Record<string, TechStack[]>>((acc, stack) => {
            (acc[stack.category || 'Other'] ??= []).push(stack);
            return acc;
        }, {}),
    );

    return (
        <GuestLayout>
            <Seo title="Home" description="Software Engineer specializing in modern web development with Laravel, React, and Golang." />

            {/* Hero */}
            <section id="hero" className="relative overflow-hidden pt-28 pb-16 md:pt-36">
                <Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
                    <div className="flex [animation:var(--animate-fade-up)] flex-col gap-7">
                        <span className="inline-flex items-center gap-2 section-index">
                            <span className="size-2 [animation:var(--animate-pulse-dot)] rounded-full bg-emerald-500" />
                            Open to new projects
                        </span>

                        <h1 className="font-heading text-6xl leading-[0.88] font-extrabold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                            Arya Gading
                            <span className="block text-muted-foreground/60">Prinandika</span>
                        </h1>

                        <p className="flex flex-wrap items-baseline gap-x-3 text-xl md:text-2xl">
                            <span className="text-muted-foreground">I build</span>
                            <TypedCycle words={words} className="font-heading font-bold tracking-[-0.02em] text-primary" />
                        </p>

                        <p className="max-w-lg text-lg leading-relaxed text-pretty text-muted-foreground">
                            Building scalable ecosystems from code to cloud — modern web &amp; mobile apps, AI integrations, and the infrastructure
                            underneath.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <MagneticLink
                                href="/projects"
                                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-shadow hover:shadow-lg hover:shadow-primary/30"
                            >
                                View my work
                                <ArrowRight className="h-4 w-4" />
                            </MagneticLink>
                            <Link
                                href="/contact"
                                className="inline-flex min-h-12 items-center rounded-full border border-border px-6 font-semibold transition-colors hover:border-primary hover:text-primary"
                            >
                                Get in touch
                            </Link>
                            <div className="flex">
                                {socials.map(({ label, href, icon: Icon }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target={href.startsWith('http') ? '_blank' : undefined}
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        <Icon className="h-5 w-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative h-80 sm:h-[440px] lg:h-[560px]">
                        <div className="absolute inset-8 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
                        {webgl ? (
                            <Suspense fallback={<Mascot className="relative mx-auto h-full" />}>
                                <HeroScene />
                            </Suspense>
                        ) : (
                            <Mascot className="relative mx-auto h-full" />
                        )}
                        <p className="absolute right-0 bottom-0 hidden section-index sm:block">Move your cursor · click me</p>
                    </div>
                </Container>
            </section>

            <Marquee
                items={words}
                className="border-y border-border bg-primary py-4 font-heading text-2xl font-bold tracking-[-0.03em] text-primary-foreground md:text-3xl"
            />

            {/* Work */}
            <section id="projects" className="py-24 md:py-32">
                <Container>
                    <FadeIn>
                        <SectionHeader index="01" label="Work" title="Selected projects" action={{ href: '/projects', label: 'All projects' }} />
                    </FadeIn>

                    {projects.length > 0 ? (
                        <div className="grid gap-5 lg:grid-cols-12">
                            {projects.slice(0, 6).map((project, i) => {
                                const image = getProjectImage(project);
                                return (
                                    <FadeIn key={project.id} delay={i * 0.08} className={workSpans[i]}>
                                        <TiltCard max={5} className="h-full">
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary"
                                            >
                                                <div className="aspect-[16/10] overflow-hidden bg-muted">
                                                    {image && (
                                                        <img
                                                            src={image}
                                                            alt={project.title}
                                                            loading="lazy"
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col gap-3 p-6">
                                                    <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                                                        <span>{String(i + 1).padStart(2, '0')}</span>
                                                        <ArrowUpRight className="h-5 w-5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                                                    </div>
                                                    <h3 className="font-heading text-2xl font-bold tracking-[-0.03em]">{project.title}</h3>
                                                    <p className="line-clamp-2 text-muted-foreground">{project.description}</p>
                                                    {project.tech_tags && project.tech_tags.length > 0 && (
                                                        <div className="mt-auto flex flex-wrap gap-2 pt-2">
                                                            {project.tech_tags.slice(0, 4).map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded-full border border-border px-3 py-1 font-mono text-xs"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        </TiltCard>
                                    </FadeIn>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyBlock text="Projects will appear here once added from the dashboard." />
                    )}
                </Container>
            </section>

            {/* Stack */}
            {stackGroups.length > 0 && (
                <section id="tech" className="border-t border-border py-24 md:py-32">
                    <Container className="grid gap-12 lg:grid-cols-[1fr_2fr]">
                        <FadeIn>
                            <SectionHeader index="02" label="Stack" title="Tools I reach for" className="mb-0" />
                        </FadeIn>
                        <div className="border-t border-border">
                            {stackGroups.map(([category, stacks], i) => (
                                <FadeIn key={category} delay={i * 0.05}>
                                    <div className="grid gap-4 border-b border-border py-6 sm:grid-cols-[160px_1fr]">
                                        <span className="pt-2 section-index">{category}</span>
                                        <div className="flex flex-wrap gap-2">
                                            {stacks.map((stack) => {
                                                const icon = stack.icon ? `/storage/${stack.icon}` : stack.icon_url;
                                                return (
                                                    <span
                                                        key={stack.id}
                                                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-medium transition-colors hover:border-primary"
                                                    >
                                                        {icon && (
                                                            <img
                                                                src={icon}
                                                                alt=""
                                                                width={18}
                                                                height={18}
                                                                loading="lazy"
                                                                className="size-[18px] object-contain"
                                                            />
                                                        )}
                                                        {stack.name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* Journey */}
            <section id="resume" className="border-t border-border py-24 md:py-32">
                <Container>
                    <FadeIn>
                        <SectionHeader index="03" label="Journey" title="Where I've been" action={{ href: '/activities', label: 'All activities' }} />
                    </FadeIn>
                    {activities.length > 0 ? (
                        <div className="grid border-t-2 border-foreground sm:grid-cols-2 lg:grid-cols-4">
                            {activities.slice(0, 4).map((activity, i) => (
                                <FadeIn key={activity.id} delay={i * 0.08}>
                                    <Link href={`/activities/${activity.id}`} className="group relative flex flex-col gap-2 py-8 pr-6">
                                        <span
                                            className={cn(
                                                'absolute -top-[9px] left-0 size-4 rounded-full border-2 border-foreground transition-colors group-hover:bg-primary',
                                                i === 0 ? 'border-primary bg-primary' : 'bg-background',
                                            )}
                                        />
                                        <span className={cn('mt-2 font-mono text-xs', i === 0 ? 'text-primary' : 'text-muted-foreground')}>
                                            {formatMonth(activity.start_date)}
                                            {activity.start_date && (activity.end_date ? ` – ${formatMonth(activity.end_date)}` : ' – Now')}
                                        </span>
                                        <span className="font-heading text-xl font-bold tracking-[-0.02em] transition-colors group-hover:text-primary">
                                            {activity.role || activity.title}
                                        </span>
                                        <span className="text-muted-foreground">{activity.organization || activity.title}</span>
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <EmptyBlock text="Experience and activities will appear here soon." />
                    )}
                </Container>
            </section>

            {/* Writing */}
            <section id="writing" className="border-t border-border py-24 md:py-32">
                <Container>
                    <FadeIn>
                        <SectionHeader index="04" label="Writing" title="Notes & tutorials" action={{ href: '/blog', label: 'All posts' }} />
                    </FadeIn>
                    {posts.length > 0 ? (
                        <div className="border-t border-border">
                            {posts.slice(0, 4).map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group grid items-center gap-2 border-b border-border py-6 transition-all hover:bg-card sm:grid-cols-[140px_1fr_auto] sm:gap-6 sm:hover:px-4"
                                >
                                    <span className="font-mono text-xs text-muted-foreground">{formatMonth(post.published_at)}</span>
                                    <span className="font-heading text-xl font-semibold tracking-[-0.02em] md:text-2xl">{post.title}</span>
                                    <ArrowUpRight className="hidden h-6 w-6 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:block" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyBlock text="New articles and tutorials are coming soon." />
                    )}
                </Container>
            </section>

            {/* Tools + favorites */}
            <section id="favorites" className="border-t border-border py-24 md:py-32">
                <Container className="grid gap-5 lg:grid-cols-12">
                    <FadeIn className="lg:col-span-7">
                        <div className="flex h-full flex-col gap-6 rounded-3xl bg-accent2 p-8 text-accent2-foreground md:p-10">
                            <span className="font-mono text-xs tracking-[0.14em] uppercase opacity-80">05 / Tools · free</span>
                            <h2 className="font-heading text-4xl leading-[0.95] font-extrabold tracking-[-0.045em] md:text-5xl">
                                7 tools. Zero uploads. Your files never leave the browser.
                            </h2>
                            <div className="mt-auto flex flex-wrap gap-2">
                                {tools.map((tool) => (
                                    <Link
                                        key={tool.href}
                                        href={tool.href}
                                        className="inline-flex min-h-11 items-center rounded-full bg-background/90 px-4 text-sm font-medium text-foreground transition-colors hover:bg-background"
                                    >
                                        {tool.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.1} className="flex flex-col gap-3 lg:col-span-5">
                        <div className="flex items-center justify-between">
                            <span className="section-index">On rotation</span>
                            <Link href="/favorites" className="inline-flex min-h-11 items-center font-mono text-xs hover:text-primary">
                                All favorites →
                            </Link>
                        </div>
                        {favorites.length > 0 ? (
                            favorites.slice(0, 3).map((favorite) => {
                                const Icon = favoriteIcon[favorite.type];
                                return (
                                    <Link
                                        key={favorite.id}
                                        href="/favorites"
                                        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary"
                                    >
                                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
                                            {favorite.image ? (
                                                <img
                                                    src={`/storage/${favorite.image}`}
                                                    alt=""
                                                    loading="lazy"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Icon className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-mono text-[0.7rem] tracking-[0.14em] text-primary uppercase">{favorite.type}</span>
                                            <p className="truncate font-heading text-lg font-semibold">{favorite.title}</p>
                                            {favorite.creator && <p className="truncate text-sm text-muted-foreground">{favorite.creator}</p>}
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <p className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">Favorites coming soon.</p>
                        )}
                    </FadeIn>
                </Container>
            </section>

            {/* Contact */}
            <section className="pb-24 md:pb-32">
                <Container>
                    <FadeIn>
                        <div className="relative grid items-end gap-8 overflow-hidden rounded-[2rem] bg-primary p-8 text-primary-foreground md:grid-cols-[1fr_auto] md:p-14">
                            <div className="flex flex-col gap-8">
                                <span className="font-mono text-xs tracking-[0.14em] uppercase opacity-80">Got an idea?</span>
                                <h2 className="font-heading text-5xl leading-[0.88] font-extrabold tracking-[-0.06em] md:text-8xl">
                                    Let&apos;s build something good.
                                </h2>
                                <div className="flex flex-wrap items-center gap-4">
                                    <MagneticLink
                                        href="/contact"
                                        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-6 font-semibold text-background"
                                    >
                                        Start a project
                                        <ArrowRight className="h-4 w-4" />
                                    </MagneticLink>
                                    <a
                                        href="mailto:me@aryagading.com"
                                        className="border-b-2 border-current pb-0.5 font-heading text-xl font-semibold md:text-2xl"
                                    >
                                        me@aryagading.com
                                    </a>
                                </div>
                            </div>
                            <Mascot pose="wave" className="hidden h-64 w-56 md:block" />
                        </div>
                    </FadeIn>
                </Container>
            </section>
        </GuestLayout>
    );
}
