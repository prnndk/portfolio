'use client';

import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Linkedin, Mail, Send, FileText } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { Spotlight } from '@/components/aceternity/spotlight';
import { TextReveal, FadeIn } from '@/components/aceternity/text-reveal';
import { ProjectCard } from '@/components/aceternity/card-hover';
import { TimelineItem, BlogCard } from '@/components/portfolio/sections';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type Activity, type Post, type Project, type TechStack } from '@/types';
import { type FormEvent } from 'react';
import { toast } from 'sonner';
import { Seo } from '@/components/seo';
import { FlipWords } from '@/components/ui/flip-words';
import { TechStackGrid } from '@/components/tech-stack-grid';
import { TechStackOrbit } from '@/components/tech-stack-orbit';
import { Highlighter } from '@/components/ui/highlighter';
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
}

export default function Welcome({ projects = [], activities = [], posts = [], techStacks = [] }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        message: '',
    });

    const words = ["Web Applications", "Mobile Apps", "Software Application", "Infrastructure", "AI Integration"]

    const handleContactSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('Message sent successfully!', {
                    description: 'Thank you for reaching out. I will get back to you soon.',
                });
            },
            onError: () => {
                toast.error('Failed to send message', {
                    description: 'Please check the form for errors and try again.',
                });
            },
        });
    };

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
                <Spotlight className="dark:opacity-50" fill="rgb(96, 165, 250)" />

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
                                <a href="/projects">
                                    View My Work
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <a href="#contact">Get In Touch</a>
                            </Button>
                        </div>
                    </TextReveal>

                    <TextReveal delay={1.2}>
                        <div className="mt-8 flex gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <a href="https://github.com/prnndk" target="_blank" rel="noopener noreferrer">
                                    <svg className='size-5' role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <a href="https://linkedin.com/in/aryagading" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="h-5 w-5" />
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

                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="h-14 w-8 rounded-full border-2 border-muted-foreground/30 p-1">
                        <motion.div
                            className="h-3 w-full rounded-full bg-primary"
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
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
                                    <a href={`/projects/${project.slug}`}>
                                        <ProjectCard
                                            title={project.title}
                                            description={project.description}
                                            image={project.image ? `/storage/${project.image}` : undefined}
                                            tags={project.tech_tags || []}
                                            url={project.url}
                                            githubUrl={project.github_url}
                                        />
                                    </a>
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
                            <p className="text-muted-foreground">
                                Projects will appear here once you add them from the admin dashboard.
                            </p>
                        </div>
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

                    {/* Orbiting Circles */}
                    <FadeIn delay={0.2}>
                        <TechStackOrbit techStacks={techStacks} />
                    </FadeIn>

                    {/* Card Grid with Glowing Effect */}
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

            {/* Resume/Timeline Section */}
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
                        <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center">
                            <p className="text-muted-foreground">
                                Activities and experience will appear here once you add them from the admin dashboard.
                            </p>
                        </div>
                    )}
                </div>
            </section >

            {/* Blog Section */}
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
                                <a href="/blog">View All</a>
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

            {/* Contact Section */}
            <section id="contact" className="py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-2xl text-center">
                        <FadeIn>
                            <h2 className="font-heading text-3xl font-bold md:text-4xl">
                                Get In Touch
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Have a project in mind? Let's talk about it.
                            </p>
                        </FadeIn>

                        <FadeIn delay={0.2}>
                            <form onSubmit={handleContactSubmit} className="mt-12 space-y-4 text-left">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="mb-2 block text-sm font-medium">
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Your name"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="message" className="mb-2 block text-sm font-medium">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Tell me about your project..."
                                        rows={5}
                                        required
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    {errors.message && <p className="mt-1 text-sm text-destructive">{errors.message}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {processing ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        </FadeIn>
                    </div>
                </div>
            </section>
        </GuestLayout >
    );
}
