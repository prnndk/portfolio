import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Send } from 'lucide-react';
import { FormEventHandler } from 'react';
import { motion } from 'framer-motion';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { cn } from '@/lib/utils';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout title="Forgot password?" description="No worries, we'll send you reset instructions">
            <Head title="Forgot password" />

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3 text-center text-sm font-medium text-green-600 dark:text-green-400"
                >
                    {status}
                </motion.div>
            )}

            <form className="flex flex-col gap-5" onSubmit={submit}>
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        Email address
                    </Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            className={cn(
                                "pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all",
                                errors.email && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="mt-2 h-11 w-full font-medium transition-all hover:shadow-lg hover:shadow-primary/20"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Send reset link
                        </>
                    )}
                </Button>

                {/* Divider */}
                <div className="relative mt-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground/60">
                            Remember your password?
                        </span>
                    </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <TextLink
                        href={route('login')}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Back to sign in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
