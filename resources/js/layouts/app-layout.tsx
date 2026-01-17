import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { type ReactNode, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

interface PageProps extends SharedData {
    errors?: Record<string, string>;
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {
    const { props: inertiaProps } = usePage<PageProps>();
    const flash = inertiaProps.flash;
    const errors = inertiaProps.errors;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Handle validation errors - show toast when there are errors
    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            const errorMessages = Object.values(errors);
            const errorCount = errorMessages.length;

            if (errorCount === 1) {
                toast.error(errorMessages[0]);
            } else {
                toast.error(`Validation failed with ${errorCount} errors`, {
                    description: errorMessages.slice(0, 3).join(', ') + (errorCount > 3 ? '...' : ''),
                });
            }
        }
    }, [errors]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster />
        </AppLayoutTemplate>
    );
}
