'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Linkedin, Mail, Instagram, Download, MapPin, Code2, Camera, Laptop, Sparkles, Github, Coffee, Gamepad2, BookOpen, Music, MessageSquare, Star } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { Spotlight } from '@/components/ui/spotlight-new';
import { TextReveal, FadeIn } from '@/components/aceternity/text-reveal';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Seo } from '@/components/seo';
import { Highlighter } from '@/components/ui/highlighter';
import { DraggableCardBody, DraggableCardContainer } from '@/components/ui/draggable-card';
import { Timeline } from '@/components/ui/timeline';
import { Floating, FloatingElement } from '@/components/ui/parallax-floating';

import { useRef } from 'react';

// Polaroid style photo card component
const PolaroidCard = ({
    icon: Icon,
    imageUrl,
    label,
    rotation,
    className,
    constraintRef,
}: {
    icon?: React.ElementType;
    imageUrl?: string;
    label: string;
    rotation: string;
    className?: string;
    constraintRef?: React.RefObject<any>;
}) => (
    <DraggableCardContainer className={className}>
        <DraggableCardBody
            constraintRef={constraintRef}
            className={`flex flex-col items-center justify-between bg-white dark:bg-neutral-900 p-3 min-h-[340px] w-64 shadow-xl ${rotation}`}
        >
            {/* Photo area */}
            <div className="relative flex-1 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4 h-64">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={label}
                        className="absolute inset-0 h-full w-full object-cover pointer-events-none select-none transition-transform duration-500 hover:scale-110"
                        draggable={false}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                        {Icon && <Icon className="h-16 w-16 text-primary/60" strokeWidth={1.5} />}
                    </div>
                )}
            </div>
            {/* Label area */}
            <div className="w-full text-center pb-2">
                <p className="font-handwriting text-base text-muted-foreground/80">{label}</p>
            </div>
        </DraggableCardBody>
    </DraggableCardContainer>
);

// Timeline data
const timelineData = [
    {
        title: "2024",
        content: (
            <div>
                <p className="text-foreground text-sm md:text-base font-semibold mb-2">
                    Full-Stack Developer & Tech Lead
                </p>
                <p className="text-muted-foreground text-sm md:text-base mb-4">
                    Leading development of enterprise applications, implementing microservices architecture,
                    and mentoring junior developers. Built scalable systems handling thousands of concurrent users.
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">Laravel</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">React</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">Go</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">Kubernetes</span>
                </div>
            </div>
        ),
    },
    {
        title: "2023",
        content: (
            <div>
                <p className="text-foreground text-sm md:text-base font-semibold mb-2">
                    Software Engineer
                </p>
                <p className="text-muted-foreground text-sm md:text-base mb-4">
                    Developed and maintained multiple web applications. Implemented CI/CD pipelines and
                    containerization strategies. Contributed to open-source projects and tech communities.
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">TypeScript</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">Docker</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">PostgreSQL</span>
                </div>
            </div>
        ),
    },
    {
        title: "2022",
        content: (
            <div>
                <p className="text-foreground text-sm md:text-base font-semibold mb-2">
                    Junior Developer & University
                </p>
                <p className="text-muted-foreground text-sm md:text-base mb-4">
                    Started my professional journey while completing my degree. Built foundational skills
                    in web development, database design, and software engineering principles.
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">PHP</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">JavaScript</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">MySQL</span>
                </div>
            </div>
        ),
    },
    {
        title: "2022",
        content: (
            <div>
                <p className="text-foreground text-sm md:text-base font-semibold mb-2">
                    Graduate from SMAN 1 Blitar
                </p>
                <p className="text-muted-foreground text-sm md:text-base mb-4">
                    Graduate from high school, i managed to learn and create my first application using Laravel.
                    In high school, i joined in OSIS that was handling extracurricular regarding IT.
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">HTML/CSS</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">Python</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">Git</span>
                </div>
            </div>
        ),
    },
];

export default function About() {
    const containerRef = useRef<HTMLElement>(null);

    return (
        <GuestLayout>
            {/* Ambient Background */}
            <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block overflow-hidden transition-opacity duration-700">
                <div className="absolute -top-[20%] -right-[10%] h-[70vh] w-[70vh] rounded-full bg-blue-600/20 blur-[100px] opacity-20" />
                <div className="absolute top-[30%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-indigo-600/20 blur-[100px] opacity-20" />
                <div className="absolute -bottom-[20%] right-[20%] h-[60vh] w-[60vh] rounded-full bg-violet-600/20 blur-[100px] opacity-20" />
            </div>

            <Seo
                title="About Me | Portfolio Arya Gading Prinandika"
                description="Learn more about Arya Gading Prinandika - a passionate software engineer specializing in modern web development."
            />

            {/* Hero Section with Draggable Polaroid Photos */}
            <section ref={containerRef} className="relative min-h-screen overflow-hidden">
                <Spotlight />

                <div className="container mx-auto flex min-h-screen flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 py-24">
                    {/* Draggable Polaroid Photos */}
                    <div className="relative w-full max-w-lg h-[400px] lg:h-[500px] flex-shrink-0">
                        {/* Instructions */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 whitespace-nowrap"
                        >
                            Drag the cards around!
                        </motion.p>

                        {/* Polaroid 1 - Top Left */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                            animate={{ opacity: 1, scale: 1, rotate: -8 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="absolute top-0 left-4 md:left-0 z-10"
                        >
                            <PolaroidCard
                                icon={Camera}
                                imageUrl="profile.jpg"
                                label="Capturing moments"
                                rotation="rotate-[-8deg]"
                                constraintRef={containerRef}
                            />
                        </motion.div>

                        {/* Polaroid 2 - Center */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                            animate={{ opacity: 1, scale: 1, rotate: 3 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="absolute top-12 left-1/2 -translate-x-1/2 md:translate-x-0 md:top-16 md:left-28 z-20"
                        >
                            <PolaroidCard
                                icon={Laptop}
                                imageUrl="profile.jpg"
                                label="Building things"
                                rotation="rotate-[3deg]"
                                constraintRef={containerRef}
                            />
                        </motion.div>

                        {/* Polaroid 3 - Bottom Right */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 6 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                            className="absolute top-24 right-4 md:top-32 md:right-0 z-30"
                        >
                            <PolaroidCard
                                icon={Sparkles}
                                imageUrl="profile.jpg"
                                label="Creating magic"
                                rotation="rotate-[6deg]"
                                constraintRef={containerRef}
                            />
                        </motion.div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 text-center lg:text-left max-w-xl">
                        <TextReveal delay={0.2}>
                            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                                About Me
                            </span>
                        </TextReveal>

                        <TextReveal delay={0.4}>
                            <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                                I'm <Highlighter action="underline" color="#87CEFA" delay={900}>Arya Gading</Highlighter>
                            </h1>
                        </TextReveal>

                        <TextReveal delay={0.6}>
                            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                                A passionate <span className="text-foreground font-medium">Full-Stack Developer</span> and <span className="text-foreground font-medium">Learner</span> based in Indonesia,
                                specializing in building modern web applications that solve real-world problems.
                            </p>
                        </TextReveal>

                        <TextReveal delay={0.8}>
                            <p className="mt-4 text-muted-foreground leading-relaxed">
                                With expertise in Laravel, NodeJS, Go, and cloud infrastructure, I craft scalable solutions
                                from concept to deployment. When I'm not coding, you'll find me exploring new technologies
                                or gaming.
                            </p>
                        </TextReveal>

                        <TextReveal delay={1}>
                            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span className="text-sm">Indonesia</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Code2 className="h-4 w-4 text-primary" />
                                    <span className="text-sm">3+ Years Experience</span>
                                </div>
                            </div>
                        </TextReveal>

                        <TextReveal delay={1.2}>
                            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                                <Button size="lg" asChild>
                                    <Link href="/contact">
                                        Get In Touch
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <a href="/resume.pdf" download>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download CV
                                    </a>
                                </Button>
                            </div>
                        </TextReveal>
                    </div>
                </div>
            </section>

            {/* What I Do Section */}
            <section className="py-24 border-t border-border bg-card">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <h2 className="font-heading text-3xl font-bold md:text-4xl">
                                What I Do
                            </h2>
                            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                                I specialize in building end-to-end solutions, from designing intuitive user interfaces
                                to architecting robust backend systems.
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <FadeIn delay={0.1}>
                            <div className="group rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/50 hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Code2 className="h-6 w-6" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold">Web Development</h3>
                                <p className="mt-2 text-muted-foreground">
                                    Building modern, responsive web applications with React, Next.js, Golang, and Laravel.
                                    Focused on performance, accessibility, and user experience.
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <div className="group rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/50 hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <h3 className="font-heading text-xl font-semibold">Backend & APIs</h3>
                                <p className="mt-2 text-muted-foreground">
                                    Designing and developing scalable REST APIs with Go, Laravel, and Node.js.
                                    Database design, authentication, and microservices architecture.
                                </p>
                            </div>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <div className="group rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/50 hover:shadow-lg">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                    </svg>
                                </div>
                                <h3 className="font-heading text-xl font-semibold">DevOps & Cloud</h3>
                                <p className="mt-2 text-muted-foreground">
                                    Managing deployments with Docker, and CI/CD pipelines.
                                    Cloud infrastructure on AWS, GCP, and self-hosted solutions.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Timeline / Journey Section */}
            <section className="border-t border-border">
                <Timeline
                    data={timelineData}
                    title="My Journey"
                    description="From curious beginner to building production-grade applications. Here's how my story unfolded."
                />
            </section>

            {/* Fun Facts Section */}
            <section className="py-24 border-t border-border bg-card">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <h2 className="font-heading text-3xl font-bold md:text-4xl">
                                Beyond The Code
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                A few things that keep me going
                            </p>
                        </div>
                    </FadeIn>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
                        <FadeIn delay={0.1}>
                            <div className="h-full min-h-[180px] text-center p-6 rounded-2xl border border-border bg-background hover:border-primary/50 transition-all flex flex-col items-center">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 mb-3">
                                    <Coffee className="h-6 w-6" />
                                </div>
                                <h3 className="font-heading font-semibold">Coffee Lover</h3>
                                <p className="text-sm text-muted-foreground mt-1 flex-1">Fuel for late-night coding sessions</p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <div className="h-full min-h-[180px] text-center p-6 rounded-2xl border border-border bg-background hover:border-primary/50 transition-all flex flex-col items-center">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mb-3">
                                    <Gamepad2 className="h-6 w-6" />
                                </div>
                                <h3 className="font-heading font-semibold">Gamer</h3>
                                <p className="text-sm text-muted-foreground mt-1 flex-1">Cities Skylines, Assassin's Creed, Football Manager and many more</p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.3}>
                            <div className="h-full min-h-[180px] text-center p-6 rounded-2xl border border-border bg-background hover:border-primary/50 transition-all flex flex-col items-center">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <h3 className="font-heading font-semibold">Learner</h3>
                                <p className="text-sm text-muted-foreground mt-1 flex-1">Always exploring new technologies</p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.4}>
                            <div className="h-full min-h-[180px] text-center p-6 rounded-2xl border border-border bg-background hover:border-primary/50 transition-all flex flex-col items-center">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-3">
                                    <Music className="h-6 w-6" />
                                </div>
                                <h3 className="font-heading font-semibold">Music Fan</h3>
                                <p className="text-sm text-muted-foreground mt-1 flex-1">Coldplay, Sheila on 7, and more</p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="py-24 border-t border-border">
                <div className="container mx-auto px-4">
                    <FadeIn>
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-3xl font-bold md:text-4xl">
                                Let's Connect
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                                Whether you have a project in mind, want to discuss opportunities,
                                or just want to say hi — I'd love to hear from you!
                            </p>
                        </div>
                    </FadeIn>

                    {/* Social Links Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
                        <FadeIn delay={0.1}>
                            <a
                                href="mailto:me@aryagading.com"
                                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:group-hover:bg-red-600 dark:group-hover:text-white">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold">Email</h3>
                                    <p className="text-sm text-muted-foreground">me@aryagading.com</p>
                                </div>
                            </a>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <a
                                href="https://github.com/prnndk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-800 transition-colors group-hover:bg-gray-800 group-hover:text-white dark:bg-gray-800 dark:text-gray-200 dark:group-hover:bg-gray-700">
                                    <Github className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold">GitHub</h3>
                                    <p className="text-sm text-muted-foreground">@prnndk</p>
                                </div>
                            </a>
                        </FadeIn>

                        <FadeIn delay={0.3}>
                            <a
                                href="https://linkedin.com/in/aryagading"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                                    <Linkedin className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold">LinkedIn</h3>
                                    <p className="text-sm text-muted-foreground">Arya Gading</p>
                                </div>
                            </a>
                        </FadeIn>

                        <FadeIn delay={0.4}>
                            <a
                                href="https://instagram.com/gadingprinandika"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-pink-600 transition-colors group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:via-pink-500 group-hover:to-orange-500 group-hover:text-white dark:bg-pink-900/30 dark:text-pink-400">
                                    <Instagram className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold">Instagram</h3>
                                    <p className="text-sm text-muted-foreground">@gadingprinandika</p>
                                </div>
                            </a>
                        </FadeIn>
                    </div>

                    {/* Main CTA Button with Floating Accessories */}
                    <FadeIn delay={0.5}>
                        <div className="mt-16 text-center flex justify-center w-full">
                            <Floating sensitivity={-0.5} className="h-60 w-full max-w-2xl flex items-center justify-center relative">
                                {/* 1. Image: Tech (Top Left) */}
                                <FloatingElement depth={0.5} className="absolute top-0 left-[15%]">
                                    <div className="h-14 w-14 overflow-hidden rounded-2xl shadow-lg rotate-[-6deg] opacity-90 grayscale hover:grayscale-0 transition-all duration-500 border border-white/10">
                                        <img
                                            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop&q=80"
                                            alt="Tech"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </FloatingElement>

                                {/* 2. Icon: Mail (Top Center-Right) */}
                                <FloatingElement depth={1} className="absolute -top-4 right-[30%]">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rotate-[12deg]">
                                        <Mail className="h-6 w-6 text-blue-500" />
                                    </div>
                                </FloatingElement>

                                {/* 3. Image: Abstract (Right) */}
                                <FloatingElement depth={2} className="absolute top-8 right-[10%]">
                                    <div className="h-16 w-16 overflow-hidden rounded-2xl shadow-lg rotate-[6deg] opacity-90 grayscale hover:grayscale-0 transition-all duration-500 border border-white/10">
                                        <img
                                            src="https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=100&h=100&fit=crop&q=80"
                                            alt="Abstract"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </FloatingElement>

                                {/* 4. Icon: Message (Bottom Left) */}
                                <FloatingElement depth={1.5} className="absolute bottom-2 left-[20%]">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 rotate-[-12deg]">
                                        <MessageSquare className="h-5 w-5 text-purple-500" />
                                    </div>
                                </FloatingElement>

                                {/* 5. Image: Matrix (Bottom Right) */}
                                <FloatingElement depth={0.8} className="absolute bottom-0 right-[20%]">
                                    <div className="h-20 w-20 overflow-hidden rounded-2xl shadow-lg rotate-[-3deg] opacity-90 grayscale hover:grayscale-0 transition-all duration-500 border border-white/10">
                                        <img
                                            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop&q=80"
                                            alt="Matrix"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </FloatingElement>

                                {/* 6. Image: Fluid (Left) */}
                                <FloatingElement depth={2.5} className="absolute top-1/2 left-[5%] -translate-y-1/2">
                                    <div className="h-12 w-12 overflow-hidden rounded-xl shadow-lg rotate-[15deg] opacity-80 grayscale hover:grayscale-0 transition-all duration-500 border border-white/10">
                                        <img
                                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop&q=80"
                                            alt="Fluid"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </FloatingElement>

                                {/* 7. Icon: Sparkles (Top Left scattered) */}
                                <FloatingElement depth={0.3} className="absolute top-10 left-[25%] opacity-50">
                                    <Sparkles className="h-6 w-6 text-amber-400 rotate-12" />
                                </FloatingElement>

                                <FloatingElement depth={0.2} className="relative z-10">
                                    <Button size="lg" className="px-10 py-6 text-lg rounded-xl shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all" asChild>
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
            </section>
        </GuestLayout>
    );
}
