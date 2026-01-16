'use client';


import { motion } from 'framer-motion';
import { ArrowRight, Linkedin, Mail, FileText, FolderOpen, Briefcase, Star, Film, Music, BookOpen, Instagram, ChevronDown } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { Spotlight } from '@/components/ui/spotlight-new';
import { TextReveal, FadeIn } from '@/components/aceternity/text-reveal';
import { ProjectCard } from '@/components/aceternity/card-hover';
import { TimelineItem, BlogCard } from '@/components/portfolio/sections';
import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { type Activity, type Post, type Project, type TechStack, type Favorite } from '@/types';
import { Seo } from '@/components/seo';
import { FlipWords } from '@/components/ui/flip-words';
import { TechStackGrid } from '@/components/tech-stack-grid';
import { TechStackOrbit } from '@/components/tech-stack-orbit';
import { Highlighter } from '@/components/ui/highlighter';
import { getProjectImage } from '@/lib/project-utils';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';

interface Props {
    projects?: Project[];
    activities?: Activity[];
    posts?: Post[];
    techStacks?: TechStack[];
    favorites?: Favorite[];
}

export default function Welcome({ projects = [], activities = [], posts = [], techStacks = [], favorites = [] }: Props) {
    // Removed unused form logic
    const words = ["Web Applications", "Mobile Apps", "Software Application", "Infrastructure", "AI Integration", "Business Solutions", "Database Solutions", "System Architecture"]

    return (
        <GuestLayout>
            {/* Ambient Background for Dark Mode */}
            <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block overflow-hidden transition-opacity duration-700">
                {/* Top Right Glow */}
                <div className="absolute -top-[20%] -right-[10%] h-[70vh] w-[70vh] rounded-full bg-blue-600/20 blur-[100px] opacity-20" />

                {/* Center/Left Glow */}
                <div className="absolute top-[30%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-indigo-600/20 blur-[100px] opacity-20" />

                {/* Bottom Right Glow */}
                <div className="absolute -bottom-[20%] right-[20%] h-[60vh] w-[60vh] rounded-full bg-violet-600/20 blur-[100px] opacity-20" />
            </div>

            <Seo
                title="Home"
                description="Software Engineer specializing in modern web development with Laravel, React, and Golang."
            />

            <section id="hero" className="relative min-h-screen overflow-hidden">
                {/* New Spotlight Background */}
                <Spotlight />

                <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
                    <TextReveal delay={0.2}>
                        <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                            Full-Stack Developer
                        </span>
                    </TextReveal>

                    <TextReveal delay={0.4}>
                        <h1 className='font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl'>Hi, I'm <Highlighter action='highlight' color='#87CEFA' delay={900}>Arya Gading Prinandika</Highlighter></h1>
                    </TextReveal>

                    <TextReveal delay={0.6}>
                        <div className="mt-4 text-xl text-muted-foreground md:text-2xl">
                            I build <FlipWords words={words} className='font-heading' />
                        </div>
                    </TextReveal>

                    <TextReveal delay={0.8}>
                        <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
                            Passionate about building scalable ecosystems from code to cloud. I specialize in developing modern web and mobile applications, implementing AI solutions, and managing the underlying deployment infrastructure.
                        </p>
                    </TextReveal>

                    <TextReveal delay={1}>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
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
                    </TextReveal>

                    <TextReveal delay={1.2}>
                        <div className="mt-8 flex gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <a href="https://github.com/prnndk" target="_blank" rel="noopener noreferrer">
                                    <svg className='size-5 dark:fill-white' role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <a href="https://linkedin.com/in/aryagading" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <a href="https://instagram.com/gadingprinandika" target="_blank" rel="noopener noreferrer">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <a href="mailto:me@aryagading.com">
                                    <Mail className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </TextReveal>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                >
                    <motion.a
                        href="#projects"
                        className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span className="text-xs font-medium uppercase tracking-wider">Scroll</span>
                        <ChevronDown className="h-5 w-5" />
                    </motion.a>
                </motion.div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="py-24">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <h2 className="font-heading text-3xl font-bold md:text-4xl">
                            Featured Projects
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Some of the things I've built
                        </p>
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
                                        <EmptyDescription>
                                            Projects will appear here once added from the admin dashboard.
                                        </EmptyDescription>
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
                            <h2 className="font-heading text-3xl font-bold md:text-4xl">
                                Tech Stack
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Technologies I work with
                            </p>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <TechStackOrbit techStacks={techStacks} />
                    </FadeIn>

                    {techStacks.length > 0 && (
                        <FadeIn delay={0.3}>
                            <div className="mt-8">
                                <p className="text-center text-sm text-muted-foreground mb-6">
                                    All Technologies
                                </p>
                                <TechStackGrid techStacks={techStacks} className="max-w-4xl mx-auto" />
                            </div>
                        </FadeIn>
                    )}
                </div>
            </section>

            < section id="resume" className="py-24" >
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <h2 className="font-heading text-3xl font-bold md:text-4xl">
                            Experience & Activities
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            My journey so far
                        </p>
                    </FadeIn>

                    {activities.length > 0 ? (
                        <div className="mt-12 max-w-3xl">
                            {activities.map((activity, index) => (
                                <TimelineItem
                                    key={activity.id}
                                    activity={activity}
                                    isLast={index === activities.length - 1}
                                />
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
                                        <EmptyDescription>
                                            Experience and activities will appear here once added from the dashboard.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </section >
            <section className="border-t border-border bg-card py-24">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-heading text-3xl font-bold md:text-4xl">
                                    Latest Posts
                                </h2>
                                <p className="mt-2 text-muted-foreground">
                                    Thoughts and tutorials
                                </p>
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
                                        <EmptyDescription>
                                            Stay tuned! New articles and tutorials are coming soon.
                                        </EmptyDescription>
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
                                <h2 className="font-heading text-3xl font-bold md:text-4xl">
                                    My Favorites
                                </h2>
                                <p className="mt-2 text-muted-foreground">
                                    Movies, music, and books that inspire me
                                </p>
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
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${favorite.type === 'movie' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        favorite.type === 'music' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                        }`}>
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
                                                <h3 className="font-heading font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                                    {favorite.title}
                                                </h3>
                                                {favorite.creator && (
                                                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                                        {favorite.creator}
                                                    </p>
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
                                        <EmptyDescription>
                                            My favorite movies, music, and books will appear here soon.
                                        </EmptyDescription>
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
                            <h2 className="font-heading text-3xl font-bold md:text-4xl">
                                Let's Work Together
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Have a project in mind or want to discuss a new opportunity? I'd love to hear from you.
                            </p>
                            <div className="mt-8">
                                <Button size="lg" asChild>
                                    <Link href="/contact">
                                        Get In Touch
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>
        </GuestLayout >
    );
}
