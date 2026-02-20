'use client';

import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Send, Mail, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { FormEventHandler, useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Seo } from '@/components/seo';


// Zod validation schema
const contactSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
    email: z
        .string()
        .email('Please enter a valid email address')
        .min(1, 'Email is required'),
    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message must be less than 5000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Extended form data with anti-spam fields
type FormDataWithSpamProtection = ContactFormData & {
    website: string; // Honeypot field
    _timestamp: number; // Form load timestamp
    [key: string]: string | number; // Index signature to satisfy FormDataType constraint
}

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

    const { data, setData, post, processing, errors: serverErrors, reset } = useForm<FormDataWithSpamProtection>({
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
                setClientErrors({});
                setTouched({});
                // Reset timestamp for next submission
                formLoadTime.current = Math.floor(Date.now() / 1000);
                setData('_timestamp', formLoadTime.current);
                toast.success('Message sent successfully!', {
                    description: 'Thank you for reaching out. I\'ll get back to you soon.',
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

            <div className="container mx-auto px-4 py-24">
                <FadeIn>
                    <div className="mb-12">
                        <Link
                            href="/"
                            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="font-heading text-4xl font-bold md:text-5xl">
                            Get In Touch
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                            Have a project in mind, or just want to chat?
                        </p>
                    </div>
                </FadeIn>

                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Contact Info */}
                    <FadeIn delay={0.1}>
                        <div className="space-y-8">
                            <p className="text-lg text-muted-foreground">
                                I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Email</h3>
                                        <a href="mailto:me@aryagading.com" className="text-muted-foreground hover:text-primary transition-colors">
                                            me@aryagading.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Location</h3>
                                        <p className="text-muted-foreground">
                                            Indonesia
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Contact Form */}
                    <FadeIn delay={0.2}>
                        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
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
                                        autoComplete='off'
                                        className={cn(
                                            hasError('name') && 'border-destructive focus-visible:ring-destructive'
                                        )}
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
                                        autoComplete='off'
                                        className={cn(
                                            hasError('email') && 'border-destructive focus-visible:ring-destructive'
                                        )}
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
                                            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors',
                                            hasError('message') && 'border-destructive focus-visible:ring-destructive'
                                        )}
                                    />
                                    <div className="flex items-center justify-between mt-1.5">
                                        <FieldError message={getError('message')} />
                                        <span className={cn(
                                            'text-xs',
                                            data.message.length > 5000 ? 'text-destructive' : 'text-muted-foreground'
                                        )}>
                                            {data.message.length}/5000
                                        </span>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {processing ? 'Sending...' : 'Send Message'}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-4">
                                    Your information is secure and will never be shared.
                                </p>
                            </form>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </GuestLayout>
    );
}
