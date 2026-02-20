import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, Terminal, Copy, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import GuestLayout from '@/layouts/guest-layout';
import { Spotlight } from '@/components/aceternity/spotlight';
import { FadeIn, TextReveal } from '@/components/aceternity/text-reveal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    status: number;
    message?: string;
    exception?: string;
    file?: string;
    line?: number;
}

export default function ErrorPage({ status, message, exception, file, line }: Props) {
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);

    const title = {
        503: 'Service Unavailable',
        500: 'Server Error',
        404: 'Page Not Found',
        403: 'Forbidden',
        419: 'Page Expired',
        429: 'Too Many Requests',
    }[status] || 'Error';

    const description = {
        503: 'We are doing some maintenance. Please check back soon.',
        500: 'Something went wrong on our servers.',
        404: 'The page you are looking for does not exist.',
        403: 'You do not have permission to access this page.',
        419: 'Your session has expired. Please refresh.',
        429: 'Too many requests. Please slow down.',
    }[status] || 'An unexpected error occurred.';

    // Only show details for 5xx server errors
    const isServerError = status >= 500;

    // Format timestamp
    const timestamp = new Date().toISOString();
    const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Copy error details to clipboard
    const copyToClipboard = () => {
        const errorDetails = [
            `Error ${status}: ${title}`,
            `Timestamp: ${timestamp}`,
            `Request ID: ${requestId}`,
            `URL: ${typeof window !== 'undefined' ? window.location.href : '/'}`,
            exception ? `Exception: ${exception}` : null,
            message ? `Message: ${message}` : null,
            file ? `File: ${file}${line ? `:${line}` : ''}` : null,
        ].filter(Boolean).join('\n');

        navigator.clipboard.writeText(errorDetails);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <GuestLayout>
            <Head title={`${status} - ${title}`} />

            <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden">
                <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="gray" />

                <div className="container px-4 flex flex-col items-center text-center">
                    <FadeIn>
                        <h1 className="font-heading text-[10rem] font-bold text-primary/10 md:text-[12rem] leading-none">
                            {status}
                        </h1>
                    </FadeIn>

                    <div className="relative -mt-16 md:-mt-24 flex flex-col items-center">
                        <TextReveal delay={0.2}>
                            <h2 className="font-heading text-2xl font-semibold md:text-4xl">
                                {title}
                            </h2>
                        </TextReveal>

                        <FadeIn delay={0.4}>
                            <p className="mt-3 text-muted-foreground">
                                {description}
                            </p>

                            <div className="mt-6 flex justify-center gap-3">
                                <Button asChild>
                                    <Link href="/">
                                        <Home className="mr-2 h-4 w-4" />
                                        Home
                                    </Link>
                                </Button>
                                <Button variant="outline" onClick={() => window.history.back()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </div>

                            {/* Show Details Button - Only for 5xx server errors */}
                            {isServerError && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="inline-flex items-center gap-2 text-xs text-muted-foreground/70 transition-colors hover:text-muted-foreground"
                                    >
                                        <Terminal className="h-3.5 w-3.5" />
                                        {showDetails ? 'Hide technical details' : 'Show technical details'}
                                        <ChevronDown className={cn(
                                            "h-3.5 w-3.5 transition-transform",
                                            showDetails && "rotate-180"
                                        )} />
                                    </button>
                                </div>
                            )}
                        </FadeIn>
                    </div>

                    {/* Terminal-style Error Details - Only for 5xx errors */}
                    <AnimatePresence>
                        {showDetails && isServerError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-full max-w-xl overflow-hidden"
                            >
                                <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-left">
                                    {/* Terminal Header */}
                                    <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                                            <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300"
                                        >
                                            {copied ? (
                                                <><Check className="h-3 w-3" /> Copied</>
                                            ) : (
                                                <><Copy className="h-3 w-3" /> Copy</>
                                            )}
                                        </button>
                                    </div>

                                    {/* Terminal Content */}
                                    <div className="p-3 font-mono text-xs space-y-2">
                                        <div className="text-zinc-500">
                                            <span className="text-cyan-400">error</span> {status}
                                        </div>
                                        <div className="text-zinc-500">
                                            <span className="text-cyan-400">time</span>{' '}
                                            <span className="text-zinc-400">{timestamp}</span>
                                        </div>
                                        <div className="text-zinc-500">
                                            <span className="text-cyan-400">id</span>{' '}
                                            <span className="text-zinc-400">{requestId}</span>
                                        </div>
                                        {exception && (
                                            <div className="text-zinc-500">
                                                <span className="text-yellow-400">exception</span>{' '}
                                                <span className="text-zinc-400">{exception}</span>
                                            </div>
                                        )}
                                        {/* Also show message in terminal for copy convenience */}
                                        {message && (
                                            <div className="text-zinc-500">
                                                <span className="text-red-400">message</span>{' '}
                                                <span className="text-zinc-400 break-all">{message}</span>
                                            </div>
                                        )}
                                        {file && (
                                            <div className="text-zinc-500">
                                                <span className="text-purple-400">file</span>{' '}
                                                <span className="text-zinc-400 break-all">{file}{line ? `:${line}` : ''}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
                                    Include request ID when contacting support
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </GuestLayout>
    );
}
