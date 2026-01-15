'use client';

import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Send, Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { FormEventHandler } from 'react';

export default function ContactIndex() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        message: '',
    });

    const handleContactSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                reset();
                toast.success('Message sent successfully!');
            },
            onError: () => {
                toast.error('Failed to send message. Please try again.');
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Contact" />

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
                                            Indonesia (Remote Available)
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
                                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
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
                        </div>
                    </FadeIn>
                </div>
            </div>
        </GuestLayout>
    );
}
