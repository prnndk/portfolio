import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { cn } from '@/lib/utils';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details to get started">
            <Head title="Register" />

            <form className="space-y-5" onSubmit={submit}>
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">
                        Full name
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="John Doe"
                            className={cn(
                                "h-11 pl-10 bg-background border-input/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50",
                                errors.name && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                        />
                    </div>
                    <InputError message={errors.name} />
                </div>

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
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
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
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Create a password"
                            className={cn(
                                "h-11 pl-10 bg-background border-input/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50",
                                errors.password && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                        />
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-foreground">
                        Confirm password
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm your password"
                            className={cn(
                                "h-11 pl-10 bg-background border-input/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50",
                                errors.password_confirmation && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                        />
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="h-11 w-full font-medium text-sm gap-2 transition-all"
                    tabIndex={5}
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        <>
                            Create account
                            <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </Button>

                {/* Login Link */}
                <div className="pt-2 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <TextLink
                        href={route('login')}
                        tabIndex={6}
                        className="font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Sign in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
