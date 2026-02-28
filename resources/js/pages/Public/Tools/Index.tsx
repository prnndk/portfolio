'use client';

import { Seo } from '@/components/seo';
import { Spotlight } from '@/components/ui/spotlight-new';
import GuestLayout from '@/layouts/guest-layout';
import { cn } from '@/lib/utils';
import { Tool } from '@/types/image-compressor';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, ImageIcon, Palette, Scissors, Sparkles, Wand2, Zap } from 'lucide-react';

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
    {
        id: 'jpg-to-pdf',
        name: 'JPG to PDF',
        description: 'Convert JPG, PNG, and other images into a PDF document. Arrange pages, set size and orientation.',
        icon: 'FileImage',
        href: '/tools/jpg-to-pdf',
        category: 'pdf',
        isNew: true,
    },
    {
        id: 'pdf-merge',
        name: 'PDF Merge',
        description: 'Combine multiple PDF files into a single document. Drag to reorder pages before merging.',
        icon: 'Merge',
        href: '/tools/pdf-merge',
        category: 'pdf',
        isNew: true,
    },
    {
        id: 'pdf-split',
        name: 'PDF Split',
        description: 'Extract specific pages or split a PDF into multiple files. Select the pages you need.',
        icon: 'Scissors',
        href: '/tools/pdf-split',
        category: 'pdf',
        isNew: true,
    },
    {
        id: 'pdf-to-images',
        name: 'PDF to Images',
        description: 'Convert each page of a PDF into high-quality JPG or PNG images. Download individually or as ZIP.',
        icon: 'ImageDown',
        href: '/tools/pdf-to-images',
        category: 'pdf',
        isNew: true,
    },
    {
        id: 'pdf-compress',
        name: 'PDF Compress',
        description: 'Reduce PDF file size by removing metadata and optimizing the document structure.',
        icon: 'FileDown',
        href: '/tools/pdf-compress',
        category: 'pdf',
        isNew: true,
    },
    {
        id: 'pdf-rotate',
        name: 'PDF Rotate',
        description: 'Rotate individual or all pages of a PDF by 90°, 180°, or 270°. Preview changes instantly.',
        icon: 'RotateCw',
        href: '/tools/pdf-rotate',
        category: 'pdf',
        isNew: true,
    },
];

const categoryColors: Record<string, string> = {
    image: 'from-blue-500/20 to-cyan-500/20 dark:from-blue-900/30 dark:to-cyan-900/30',
    text: 'from-purple-500/20 to-pink-500/20 dark:from-purple-900/30 dark:to-pink-900/30',
    utility: 'from-green-500/20 to-emerald-500/20 dark:from-green-900/30 dark:to-emerald-900/30',
    converter: 'from-orange-500/20 to-amber-500/20 dark:from-orange-900/30 dark:to-amber-900/30',
    pdf: 'from-red-500/20 to-rose-500/20 dark:from-red-900/30 dark:to-rose-900/30',
};

const categoryIcons: Record<string, React.ElementType> = {
    image: ImageIcon,
    text: FileText,
    utility: Wand2,
    converter: Scissors,
    pdf: FileText,
};

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
    const CategoryIcon = categoryIcons[tool.category];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <Link
                href={tool.href}
                className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300',
                    'hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5',
                )}
            >
                {/* Gradient background */}
                <div
                    className={cn(
                        'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                        categoryColors[tool.category],
                    )}
                />

                {/* Badges */}
                <div className="relative mb-4 flex items-center gap-2">
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
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <CategoryIcon className="h-7 w-7" />
                    </div>
                </div>

                {/* Content */}
                <div className="relative flex-1">
                    <h3 className="font-heading text-xl font-semibold text-foreground transition-colors group-hover:text-primary">{tool.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>
                </div>

                {/* Footer */}
                <div className="relative mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span>Get Started</span>
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Decorative corner gradient */}
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-tl from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </Link>
        </motion.div>
    );
}

export default function ToolsIndex() {
    return (
        <GuestLayout>
            <Seo
                title="Free Online Tools – Image Compressor, PDF Merge, Split & More"
                description="Collection of free online tools for image compression, PDF merging, splitting, rotating, compressing and converting. All tools work 100% locally in your browser — no uploads, no data leaves your device."
                url="/tools"
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        name: 'Free Online Tools',
                        description:
                            'Collection of free online tools for image compression, PDF merging, splitting, rotating, compressing and converting. All processing happens locally in your browser.',
                        url: 'https://aryagading.com/tools',
                        isPartOf: {
                            '@type': 'WebSite',
                            name: 'Arya Gading Prinandika',
                            url: 'https://aryagading.com',
                        },
                        mainEntity: {
                            '@type': 'ItemList',
                            itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Image Compressor', url: 'https://aryagading.com/tools/image-compress' },
                                { '@type': 'ListItem', position: 2, name: 'JPG to PDF Converter', url: 'https://aryagading.com/tools/jpg-to-pdf' },
                                { '@type': 'ListItem', position: 3, name: 'PDF Merge', url: 'https://aryagading.com/tools/pdf-merge' },
                                { '@type': 'ListItem', position: 4, name: 'PDF Split', url: 'https://aryagading.com/tools/pdf-split' },
                                { '@type': 'ListItem', position: 5, name: 'PDF to Images', url: 'https://aryagading.com/tools/pdf-to-images' },
                                { '@type': 'ListItem', position: 6, name: 'PDF Compress', url: 'https://aryagading.com/tools/pdf-compress' },
                                { '@type': 'ListItem', position: 7, name: 'PDF Rotate', url: 'https://aryagading.com/tools/pdf-rotate' },
                            ],
                        },
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aryagading.com' },
                            { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://aryagading.com/tools' },
                        ],
                    },
                ]}
            />

            {/* Ambient Background */}
            <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden dark:block">
                <div className="absolute -top-[20%] -right-[10%] h-[70vh] w-[70vh] rounded-full bg-blue-600/20 opacity-20 blur-[100px]" />
                <div className="absolute top-[30%] -left-[10%] h-[50vh] w-[50vh] rounded-full bg-purple-600/20 opacity-20 blur-[100px]" />
                <div className="absolute right-[20%] -bottom-[20%] h-[60vh] w-[60vh] rounded-full bg-cyan-600/20 opacity-20 blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="relative flex min-h-[50vh] items-center justify-center pt-24 pb-12">
                <Spotlight />
                <div className="container mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
                            className="relative flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-8 text-center"
                        >
                            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                <Palette className="h-7 w-7" />
                            </div>
                            <h3 className="font-heading text-lg font-semibold text-muted-foreground">More Tools Coming Soon</h3>
                            <p className="mt-2 text-sm text-muted-foreground/70">New tools will be available soon. Stay tuned!</p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
