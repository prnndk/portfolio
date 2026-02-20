import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, KeyRound } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { cn } from '@/lib/utils';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Create a new secure password for your account">
            <Head title="Reset password" />

            <form className="flex flex-col gap-5" onSubmit={submit}>
                {/* Email Field (Read-only) */}
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
                            autoComplete="email"
                            value={data.email}
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                            className="pl-10 h-11 bg-muted/50 border-border/50 text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                    <InputError message={errors.email} />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                        New password
                    </Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className={cn(
                                "pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all",
                                errors.password && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                        />
                    </div>
                    <InputError message={errors.password} />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-sm font-medium">
                        Confirm new password
                    </Label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Lock className="h-4 w-4" />
                        </div>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className={cn(
                                "pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all",
                                errors.password_confirmation && "border-destructive focus:border-destructive focus:ring-destructive/20"
                            )}
                        />
                    </div>
                    <InputError message={errors.password_confirmation} />
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
                            Resetting...
                        </>
                    ) : (
                        <>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Reset password
                        </>
                    )}
                </Button>
            </form>
        </AuthLayout>
    );
}
