'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ImageIcon, FileText, Scissors, Palette, Wand2, Zap, Sparkles } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { Spotlight } from '@/components/ui/spotlight-new';
import { Seo } from '@/components/seo';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Tool } from '@/types/image-compressor';

// Available tools list
const tools: Tool[] = [
    {
        id: 'image-compress',
        name: 'Image Compressor',
        description: 'Compress your images locally without uploading to any server. Adjust quality, crop, rotate, and convert formats.',
        icon: 'ImageIcon',
        href: '/tools/image-compress',
        category: 'image',
        isNew: true,
        isFeatured: true,
    },
    // Add more tools here as they become available
];

const categoryColors = {
    image: 'from-blue-500/20 to-cyan-500/20 dark:from-blue-900/30 dark:to-cyan-900/30',
    text: 'from-purple-500/20 to-pink-500/20 dark:from-purple-900/30 dark:to-pink-900/30',
    utility: 'from-green-500/20 to-emerald-500/20 dark:from-green-900/30 dark:to-emerald-900/30',
    converter: 'from-orange-500/20 to-amber-500/20 dark:from-orange-900/30 dark:to-amber-900/30',
};

const categoryIcons = {
    image: ImageIcon,
    text: FileText,
    utility: Wand2,
    converter: Scissors,
};

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
    const CategoryIcon = categoryIcons[tool.category];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link
                href={tool.href}
                className={cn(
                    'group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300',
                    'hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1'
                )}
            >
                {/* Gradient background */}
                <div
                    className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br',
                        categoryColors[tool.category]
                    )}
                />

                {/* Badges */}
                <div className="relative flex items-center gap-2 mb-4">
                    {tool.isNew && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                            <Sparkles className="h-3 w-3" />
                            New
                        </span>
                    )}
                    {tool.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <Zap className="h-3 w-3" />
                            Featured
                        </span>
                    )}
                </div>

                {/* Icon */}
                <div className="relative mb-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                        <CategoryIcon className="h-7 w-7" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative flex-1">
                    <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                    </p>
                </div>

                {/* Footer */}
                <div className="relative mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Get Started</span>
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Decorative corner gradient */}
                <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-gradient-to-tl from-primary/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
        </motion.div>
    );
}

export default function ToolsIndex() {
    return (
        <GuestLayout>
            <Seo
                title="Available Online Tools"
                description="Collection of free online tools for image compression, conversion, and more. All tools work locally in your browser without uploading your files."
            />

            {/* Ambient Background */}
            <div className="pointer-events-none fixed inset-0 z-0 hidden dark:block overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] h-[70vh] w-[70vh] rounded-full bg-blue-600/20 blur-[100px] opacity-20" />
                <div className="absolute top-[30%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-purple-600/20 blur-[100px] opacity-20" />
                <div className="absolute -bottom-[20%] right-[20%] h-[60vh] w-[60vh] rounded-full bg-cyan-600/20 blur-[100px] opacity-20" />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-[50vh] flex items-center justify-center pt-24 pb-12">
                <Spotlight />
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                            <Wand2 className="h-4 w-4" />
                            Online Tools
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mt-4 font-heading text-4xl font-bold md:text-5xl lg:text-6xl"
                    >
                        Online Tools
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
                    >
                        List of available online tools, free to use. Helping me, helping you and helping everyone else.
                    </motion.p>
                </div>
            </section>

            {/* Tools Grid */}
            <section className="py-16 pb-24">
                <div className="container mx-auto px-4">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {tools.map((tool, index) => (
                            <ToolCard key={tool.id} tool={tool} index={index} />
                        ))}

                        {/* Coming Soon Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: tools.length * 0.1 }}
                            className="relative flex flex-col h-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center"
                        >
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
                                <Palette className="h-7 w-7" />
                            </div>
                            <h3 className="font-heading text-lg font-semibold text-muted-foreground">
                                More Tools Coming Soon
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground/70">
                                New tools will be available soon. Stay tuned!
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
