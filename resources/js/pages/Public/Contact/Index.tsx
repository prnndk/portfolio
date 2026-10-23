'use client';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { PixelRoof } from '@/components/pixel-pal/pixel-roof';
import { LiveClock, PageContainer } from '@/components/portfolio/signal';
import { Seo } from '@/components/seo';
import { Input } from '@/components/ui/input';
import GuestLayout from '@/layouts/guest-layout';
import { cn } from '@/lib/utils';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, ArrowUpRight, Mail, MapPin, Send } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

// Zod validation schema
const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message must be less than 5000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Extended form data with anti-spam fields
type FormDataWithSpamProtection = ContactFormData & {
    website: string; // Honeypot field
    _timestamp: number; // Form load timestamp
    [key: string]: string | number; // Index signature to satisfy FormDataType constraint
};

// Field error component
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {message}
        </p>
    );
}

export default function ContactIndex() {
    // Store form load timestamp for anti-bot protection
    const formLoadTime = useRef<number>(Math.floor(Date.now() / 1000));

    const {
        data,
        setData,
        post,
        processing,
        errors: serverErrors,
        reset,
    } = useForm<FormDataWithSpamProtection>({
        name: '',
        email: '',
        message: '',
        website: '', // Honeypot - should remain empty
        _timestamp: formLoadTime.current,
    });

    // Client-side validation errors
    const [clientErrors, setClientErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});

    // Update timestamp on mount
    useEffect(() => {
        formLoadTime.current = Math.floor(Date.now() / 1000);
        setData('_timestamp', formLoadTime.current);
    }, [setData]);

    // Validate a single field
    const validateField = (field: keyof ContactFormData, value: string) => {
        try {
            const fieldSchema = contactSchema.shape[field];
            fieldSchema.parse(value);
            setClientErrors((prev) => ({ ...prev, [field]: undefined }));
        } catch (error) {
            if (error instanceof z.ZodError) {
                const firstError = error.issues[0];
                setClientErrors((prev) => ({ ...prev, [field]: firstError?.message }));
            }
        }
    };

    // Handle field change with validation
    const handleFieldChange = (field: keyof ContactFormData, value: string) => {
        setData(field, value);
        if (touched[field]) {
            validateField(field, value);
        }
    };

    // Handle field blur - validate on blur
    const handleFieldBlur = (field: keyof ContactFormData) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        validateField(field, data[field]);
    };

    // Validate entire form
    const validateForm = (): boolean => {
        const result = contactSchema.safeParse(data);
        if (!result.success) {
            const errors: Partial<Record<keyof ContactFormData, string>> = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof ContactFormData;
                if (field && !errors[field]) {
                    errors[field] = issue.message;
                }
            });
            setClientErrors(errors);
            setTouched({ name: true, email: true, message: true });
            return false;
        }
        setClientErrors({});
        return true;
    };

    const handleContactSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validate form before submitting
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        post('/contact', {
            onSuccess: () => {
                reset();
                window.dispatchEvent(new Event('pixel:celebrate'));
                setClientErrors({});
                setTouched({});
                // Reset timestamp for next submission
                formLoadTime.current = Math.floor(Date.now() / 1000);
                setData('_timestamp', formLoadTime.current);
                toast.success('Message sent successfully!', {
                    description: "Thank you for reaching out. I'll get back to you soon.",
                });
            },
            onError: (errors) => {
                // Check if it's a rate limit error
                if (errors && typeof errors === 'object' && 'message' in errors) {
                    toast.error('Too many requests', {
                        description: 'Please wait a moment before trying again.',
                    });
                } else {
                    toast.error('Failed to send message', {
                        description: 'Please try again later.',
                    });
                }
            },
        });
    };

    // Get error message (prioritize server errors)
    const getError = (field: keyof ContactFormData) => {
        return serverErrors[field] || clientErrors[field];
    };

    // Check if field has error
    const hasError = (field: keyof ContactFormData) => {
        return !!(serverErrors[field] || (touched[field] && clientErrors[field]));
    };

    return (
        <GuestLayout>
            <Seo
                title="Contact | Arya Gading Prinandika"
                description="Get in touch with Arya Gading Prinandika. Have a project in mind or just want to chat?"
                url="/contact"
            />

            <PageContainer>
                <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
                    {/* Contact Info */}
                    <FadeIn>
                        <Link
                            href="/"
                            className="mb-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-primary"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="font-heading text-6xl leading-[0.88] font-extrabold tracking-[-0.06em] md:text-8xl">
                            Get in
                            <br />
                            touch<span className="text-primary">.</span>
                        </h1>
                        <p className="mt-8 max-w-md text-lg leading-relaxed text-pretty text-muted-foreground">
                            Have a project in mind, or just want to chat? I&apos;m always open to discussing new projects, creative ideas or
                            opportunities to be part of your visions.
                        </p>

                        <div className="mt-10 border-t border-border">
                            <a
                                href="mailto:me@aryagading.com"
                                className="group flex items-center justify-between gap-4 border-b border-border py-5 transition-colors hover:text-primary"
                            >
                                <span className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <span className="font-heading text-xl font-semibold tracking-[-0.02em]">me@aryagading.com</span>
                                </span>
                                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                            <div className="flex items-center justify-between gap-4 border-b border-border py-5">
                                <span className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="font-heading text-xl font-semibold tracking-[-0.02em]">Indonesia</span>
                                </span>
                                <span className="font-mono text-sm text-muted-foreground">
                                    <LiveClock timeZone="Asia/Jakarta" /> · GMT+7
                                </span>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Contact Form */}
                    <FadeIn delay={0.2}>
                        <PixelRoof>
                            <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    {/* Honeypot field - hidden from users, bots will fill it */}
                                    <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                                        <label htmlFor="website">Website</label>
                                        <input
                                            type="text"
                                            id="website"
                                            name="website"
                                            value={data.website}
                                            onChange={(e) => setData('website', e.target.value)}
                                            tabIndex={-1}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Hidden timestamp field */}
                                    <input type="hidden" name="_timestamp" value={data._timestamp} />

                                    <div>
                                        <label htmlFor="name" className="mb-2 block text-sm font-medium">
                                            Name <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => handleFieldChange('name', e.target.value)}
                                            onBlur={() => handleFieldBlur('name')}
                                            placeholder="Your name"
                                            autoComplete="off"
                                            className={cn(hasError('name') && 'border-destructive focus-visible:ring-destructive')}
                                        />
                                        <FieldError message={getError('name')} />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-medium">
                                            Email <span className="text-destructive">*</span>
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                            onBlur={() => handleFieldBlur('email')}
                                            placeholder="your@email.com"
                                            autoComplete="off"
                                            className={cn(hasError('email') && 'border-destructive focus-visible:ring-destructive')}
                                        />
                                        <FieldError message={getError('email')} />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="mb-2 block text-sm font-medium">
                                            Message <span className="text-destructive">*</span>
                                        </label>
                                        <textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(e) => handleFieldChange('message', e.target.value)}
                                            onBlur={() => handleFieldBlur('message')}
                                            placeholder="Tell me about your project..."
                                            rows={5}
                                            className={cn(
                                                'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                                hasError('message') && 'border-destructive focus-visible:ring-destructive',
                                            )}
                                        />
                                        <div className="mt-1.5 flex items-center justify-between">
                                            <FieldError message={getError('message')} />
                                            <span
                                                className={cn('text-xs', data.message.length > 5000 ? 'text-destructive' : 'text-muted-foreground')}
                                            >
                                                {data.message.length}/5000
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        data-pixel-target
                                        data-pixel-say="Hit send!"
                                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-shadow hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60"
                                    >
                                        <Send className="h-4 w-4" />
                                        {processing ? 'Sending...' : 'Send message'}
                                    </button>
                                    <p className="mt-4 text-center text-xs text-muted-foreground">
                                        Your information is secure and will never be shared.
                                    </p>
                                </form>
                            </div>
                        </PixelRoof>
                    </FadeIn>
                </div>
            </PageContainer>
        </GuestLayout>
    );
}
