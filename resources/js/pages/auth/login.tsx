import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import { FormEventHandler } from 'react';
import { motion } from 'framer-motion';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { cn } from '@/lib/utils';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canRegister?: boolean;
}

export default function Login({ status, canRegister = true }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Welcome back" description="Enter your credentials to access your account">
            <Head title="Log in" />

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-center text-sm font-medium text-green-700 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400"
                >
                    {status}
                </motion.div>
            )}

            <form className="space-y-5" onSubmit={submit}>
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="you@example.com"
                            className={cn(
                                "h-11 pl-10 bg-background border-input/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50",
                                errors.email && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                        Password
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                            className={cn(
                                "h-11 pl-10 bg-background border-input/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50",
                                errors.password && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                        />
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2.5">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onClick={() => setData('remember', !data.remember)}
                        tabIndex={3}
                        className="h-4 w-4 border-input/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                        htmlFor="remember"
                        className="text-sm text-muted-foreground cursor-pointer select-none leading-none"
                    >
                        Remember me for 30 days
                    </Label>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="h-11 w-full font-medium text-sm gap-2 transition-all"
                    tabIndex={4}
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>

                {/* Register Link */}
                {canRegister && (
                    <div className="pt-2 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <TextLink
                            href={route('register')}
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Sign up
                        </TextLink>
                    </div>
                )}
            </form>
        </AuthLayout>
    );
}
