'use client';

import { ProjectCard } from '@/components/aceternity/card-hover';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { DotGridBg } from '@/components/portfolio/dot-grid-bg';
import { FloatingBadge } from '@/components/portfolio/floating-badge';
import { ScrollToTop } from '@/components/portfolio/scroll-to-top';
import { BlogCard, TimelineItem } from '@/components/portfolio/sections';
import { StatsBar } from '@/components/portfolio/stats-bar';
import { TerminalCard } from '@/components/portfolio/terminal-card';
import { TypedCycle } from '@/components/portfolio/typed-cycle';
import { Floating, FloatingElement } from '@/components/ui/parallax-floating';
import { Spotlight } from '@/components/ui/spotlight-new';
import GuestLayout from '@/layouts/guest-layout';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Briefcase,
    ChevronDown,
    FileText,
    Film,
    FolderOpen,
    Github,
    Instagram,
    Linkedin,
    Mail,
    MessageSquare,
    Music,
    Sparkles,
    Star,
} from 'lucide-react';

import { Seo } from '@/components/seo';
import { TechStackGrid } from '@/components/tech-stack-grid';
import { TechStackOrbit } from '@/components/tech-stack-orbit';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { getProjectGallery, getProjectImage } from '@/lib/project-utils';
import { type Activity, type Favorite, type Post, type Project, type TechStack } from '@/types';

interface Props {
    projects?: Project[];
    activities?: Activity[];
    posts?: Post[];
    techStacks?: TechStack[];
    favorites?: Favorite[];
}

export default function Welcome({ projects = [], activities = [], posts = [], techStacks = [], favorites = [] }: Props) {
    // Removed unused form logic
    const words = [
        'Web Applications',
        'Mobile Apps',
        'Software Application',
        'Infrastructure',
        'AI Integration',
        'Business Solutions',
        'Database Solutions',
        'System Architecture',
    ];

    return (
        <GuestLayout>
            <Seo title="Home" description="Software Engineer specializing in modern web development with Laravel, React, and Golang." />

            <ScrollToTop />

            <section id="hero" className="relative min-h-screen overflow-hidden">
                <DotGridBg />
                <Spotlight />

                <div className="relative z-10 container mx-auto grid min-h-screen items-center gap-12 px-4 pt-24 pb-16 lg:grid-cols-2 lg:gap-16 lg:pb-0">
                    {/* LEFT — text + CTAs */}
                    <div className="flex [animation:var(--animate-fade-up)] flex-col gap-6">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/60 bg-primary/10 px-4 py-1.5 font-mono text-[0.7rem] tracking-[0.08em] text-primary uppercase">
                            <span className="size-1.5 [animation:var(--animate-pulse-dot)] rounded-full bg-primary" />
                            Full-Stack Developer
                        </span>

                        <p className="text-base text-muted-foreground md:text-lg">Hello, World! 👋</p>

                        <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.04em] md:text-6xl lg:text-7xl">
                            Hi, I&apos;m Arya{' '}
                            <span className="relative inline-block text-primary">
                                Gading
                                <span className="absolute inset-x-0 -bottom-0.5 h-[3px] origin-left scale-x-0 [animation:var(--animate-underline-in)] rounded-sm bg-primary" />
                            </span>
                            <br />
                            Prinandika
                        </h1>

                        <div className="flex flex-wrap items-baseline gap-x-3 text-xl md:text-2xl">
                            <span className="text-muted-foreground">I build</span>
                            <TypedCycle words={words} className="font-heading font-semibold tracking-[-0.02em] text-[color:var(--accent2)]" />
                        </div>

                        <p className="max-w-lg leading-relaxed text-pretty text-muted-foreground">
                            Passionate about building scalable ecosystems from code to cloud. I specialize in developing modern web and mobile
                            applications, implementing AI solutions, and managing the underlying deployment infrastructure.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/projects">
                                    View My Work
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/contact">Get In Touch</Link>
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="icon" className="rounded-full" asChild>
                                <a href="https://github.com/prnndk" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <Github className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full" asChild>
                                <a href="https://linkedin.com/in/aryagading" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full" asChild>
                                <a href="https://instagram.com/gadingprinandika" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-full" asChild>
                                <a href="mailto:me@aryagading.com" aria-label="Email">
                                    <Mail className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT — terminal + floating badges */}
                    <div className="relative flex items-center justify-center">
                        <FloatingBadge
                            label="React · Next.js"
                            dotColor="primary"
                            className="absolute -top-4 right-2 rotate-[-3deg] sm:-right-6"
                            delay="0s"
                        />
                        <FloatingBadge
                            label="Node · Python"
                            dotColor="accent2"
                            className="absolute bottom-6 left-2 rotate-[2deg] sm:-left-7"
                            delay="1.5s"
                        />
                        <FloatingBadge
                            label="AWS · Docker"
                            dotColor="emerald"
                            className="absolute top-1/2 right-2 -translate-y-1/2 rotate-[-2deg] sm:-right-8"
                            delay="0.8s"
                        />
                        <TerminalCard />
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                >
                    <motion.a
                        href="#projects"
                        className="flex cursor-pointer flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <span className="font-mono text-[0.65rem] tracking-[0.15em] uppercase">Scroll</span>
                        <ChevronDown className="h-5 w-5" />
                    </motion.a>
                </motion.div>
            </section>

            {/* Stats bar */}
            <StatsBar />

            {/* Projects Section */}
            <section id="projects" className="py-24">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <h2 className="font-heading text-3xl font-bold md:text-4xl">Featured Projects</h2>
                        <p className="mt-2 text-muted-foreground">Some of the things I've built</p>
                    </FadeIn>

                    {projects.length > 0 ? (
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project, index) => (
                                <FadeIn key={project.id} delay={index * 0.1}>
                                    <Link href={`/projects/${project.slug}`}>
                                        <ProjectCard
                                            title={project.title}
                                            description={project.description}
                                            image={getProjectImage(project)}
                                            gallery={getProjectGallery(project)}
                                            tags={project.tech_tags || []}
                                        />
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <FadeIn delay={0.2}>
                            <div className="mt-12 rounded-2xl border border-dashed border-border/50 bg-card/50 p-12">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <FolderOpen className="h-6 w-6" />
                                        </EmptyMedia>
                                        <EmptyTitle>No projects yet</EmptyTitle>
                                        <EmptyDescription>Projects will appear here once added from the admin dashboard.</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </section>

            {/* Tech Stack Section */}
            <section id="tech" className="overflow-hidden border-y border-border bg-card py-20">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <div className="text-center">
                            <h2 className="font-heading text-3xl font-bold md:text-4xl">Tech Stack</h2>
                            <p className="mt-2 text-muted-foreground">Technologies I work with</p>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <TechStackOrbit techStacks={techStacks} />
                    </FadeIn>

                    {techStacks.length > 0 && (
                        <FadeIn delay={0.3}>
                            <div className="mt-8">
                                <p className="mb-6 text-center text-sm text-muted-foreground">All Technologies</p>
                                <TechStackGrid techStacks={techStacks} className="mx-auto max-w-4xl" />
                            </div>
                        </FadeIn>
                    )}
                </div>
            </section>

            <section id="resume" className="py-24">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <h2 className="font-heading text-3xl font-bold md:text-4xl">Experience & Activities</h2>
                        <p className="mt-2 text-muted-foreground">My journey so far</p>
                    </FadeIn>

                    {activities.length > 0 ? (
                        <div className="mt-12 max-w-3xl">
                            {activities.map((activity, index) => (
                                <TimelineItem key={activity.id} activity={activity} isLast={index === activities.length - 1} />
                            ))}
                        </div>
                    ) : (
                        <FadeIn delay={0.2}>
                            <div className="mt-12 rounded-2xl border border-dashed border-border/50 bg-card/50 p-12">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Briefcase className="h-6 w-6" />
                                        </EmptyMedia>
                                        <EmptyTitle>No activities yet</EmptyTitle>
                                        <EmptyDescription>Experience and activities will appear here once added from the dashboard.</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </section>
            <section className="border-t border-border bg-card py-24">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-heading text-3xl font-bold md:text-4xl">Latest Posts</h2>
                                <p className="mt-2 text-muted-foreground">Thoughts and tutorials</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/blog">View All</Link>
                            </Button>
                        </div>
                    </FadeIn>

                    {posts.length > 0 ? (
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {posts.slice(0, 3).map((post, index) => (
                                <FadeIn key={post.id} delay={index * 0.1}>
                                    <BlogCard post={post} />
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <FadeIn delay={0.2}>
                            <div className="mt-12 rounded-2xl border border-dashed border-border/50 bg-card/50 p-12">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <FileText className="h-6 w-6" />
                                        </EmptyMedia>
                                        <EmptyTitle>No blog posts yet</EmptyTitle>
                                        <EmptyDescription>Stay tuned! New articles and tutorials are coming soon.</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </section>

            <section id="favorites" className="border-t border-border bg-card py-24">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-heading text-3xl font-bold md:text-4xl">My Favorites</h2>
                                <p className="mt-2 text-muted-foreground">Movies, music, and books that inspire me</p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/favorites">View All</Link>
                            </Button>
                        </div>
                    </FadeIn>

                    {favorites.length > 0 ? (
                        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {favorites.slice(0, 6).map((favorite, index) => (
                                <FadeIn key={favorite.id} delay={index * 0.1}>
                                    <Link href="/favorites" className="group block">
                                        <div className="overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-primary/50 hover:shadow-lg">
                                            {favorite.image ? (
                                                <div className="aspect-[4/3] overflow-hidden">
                                                    <img
                                                        src={`/storage/${favorite.image}`}
                                                        alt={favorite.title}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex aspect-[4/3] items-center justify-center bg-muted">
                                                    {favorite.type === 'movie' && <Film className="h-12 w-12 text-muted-foreground" />}
                                                    {favorite.type === 'music' && <Music className="h-12 w-12 text-muted-foreground" />}
                                                    {favorite.type === 'book' && <BookOpen className="h-12 w-12 text-muted-foreground" />}
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            favorite.type === 'movie'
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                : favorite.type === 'music'
                                                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}
                                                    >
                                                        {favorite.type === 'movie' && <Film className="h-3 w-3" />}
                                                        {favorite.type === 'music' && <Music className="h-3 w-3" />}
                                                        {favorite.type === 'book' && <BookOpen className="h-3 w-3" />}
                                                        {favorite.type.charAt(0).toUpperCase() + favorite.type.slice(1)}
                                                    </span>
                                                    {favorite.rating && (
                                                        <span className="flex items-center gap-1 text-xs text-amber-500">
                                                            <Star className="h-3 w-3 fill-current" />
                                                            {favorite.rating}/10
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="line-clamp-1 font-heading font-semibold transition-colors group-hover:text-primary">
                                                    {favorite.title}
                                                </h3>
                                                {favorite.creator && (
                                                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{favorite.creator}</p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <FadeIn delay={0.2}>
                            <div className="mt-12 rounded-2xl border border-dashed border-border/50 bg-background/50 p-12">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Star className="h-6 w-6" />
                                        </EmptyMedia>
                                        <EmptyTitle>No favorites yet</EmptyTitle>
                                        <EmptyDescription>My favorite movies, music, and books will appear here soon.</EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <FadeIn>
                            <h2 className="font-heading text-3xl font-bold md:text-4xl">Let's Work Together</h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Have a project in mind or want to discuss a new opportunity? I'd love to hear from you.
                            </p>
                            <div className="mt-8 flex w-full justify-center">
                                <Floating sensitivity={-0.5} className="relative flex h-60 w-full max-w-2xl items-center justify-center">
                                    {/* 1. Image: Tech (Top Left) */}
                                    <FloatingElement depth={0.5} className="absolute top-0 left-[15%]">
                                        <div className="h-14 w-14 rotate-[-6deg] overflow-hidden rounded-2xl border border-white/10 opacity-90 shadow-lg grayscale transition-all duration-500 hover:grayscale-0">
                                            <img
                                                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop&q=80"
                                                alt="Tech"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </FloatingElement>

                                    {/* 2. Icon: Mail (Top Center-Right) */}
                                    <FloatingElement depth={1} className="absolute -top-4 right-[30%]">
                                        <div className="flex h-12 w-12 rotate-[12deg] items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
                                            <Mail className="h-6 w-6 text-blue-500" />
                                        </div>
                                    </FloatingElement>

                                    {/* 3. Image: Abstract (Right) */}
                                    <FloatingElement depth={2} className="absolute top-8 right-[10%]">
                                        <div className="h-16 w-16 rotate-[6deg] overflow-hidden rounded-2xl border border-white/10 opacity-90 shadow-lg grayscale transition-all duration-500 hover:grayscale-0">
                                            <img
                                                src="https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=100&h=100&fit=crop&q=80"
                                                alt="Abstract"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </FloatingElement>

                                    {/* 4. Icon: Message (Bottom Left) */}
                                    <FloatingElement depth={1.5} className="absolute bottom-2 left-[20%]">
                                        <div className="flex h-10 w-10 rotate-[-12deg] items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
                                            <MessageSquare className="h-5 w-5 text-purple-500" />
                                        </div>
                                    </FloatingElement>

                                    {/* 5. Image: Matrix (Bottom Right) */}
                                    <FloatingElement depth={0.8} className="absolute right-[20%] bottom-0">
                                        <div className="h-20 w-20 rotate-[-3deg] overflow-hidden rounded-2xl border border-white/10 opacity-90 shadow-lg grayscale transition-all duration-500 hover:grayscale-0">
                                            <img
                                                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop&q=80"
                                                alt="Matrix"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </FloatingElement>

                                    {/* 6. Image: Fluid (Left) */}
                                    <FloatingElement depth={2.5} className="absolute top-1/2 left-[5%] -translate-y-1/2">
                                        <div className="h-12 w-12 rotate-[15deg] overflow-hidden rounded-xl border border-white/10 opacity-80 shadow-lg grayscale transition-all duration-500 hover:grayscale-0">
                                            <img
                                                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80"
                                                alt="Fluid"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </FloatingElement>

                                    {/* 7. Icon: Sparkles (Top Left scattered) */}
                                    <FloatingElement depth={0.3} className="absolute top-10 left-[25%] opacity-50">
                                        <Sparkles className="h-6 w-6 rotate-12 text-amber-400" />
                                    </FloatingElement>

                                    <FloatingElement depth={0.2} className="relative z-10">
                                        <Button
                                            size="lg"
                                            className="rounded-xl px-10 py-6 text-lg shadow-2xl transition-all hover:-translate-y-1 hover:shadow-primary/30"
                                            asChild
                                        >
                                            <Link href="/contact">
                                                Get In Touch
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </FloatingElement>
                                </Floating>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
