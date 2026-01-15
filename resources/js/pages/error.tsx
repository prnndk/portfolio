import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';
import GuestLayout from '@/layouts/guest-layout';
import { Spotlight } from '@/components/aceternity/spotlight';
import { FadeIn, TextReveal } from '@/components/aceternity/text-reveal';
import { Button } from '@/components/ui/button';

interface Props {
    status: number;
}

export default function ErrorPage({ status }: Props) {
    const title = {
        503: 'Service Unavailable',
        500: 'Server Error',
        404: 'Page Not Found',
        403: 'Forbidden',
    }[status] || 'Error';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers.',
        404: 'Sorry, the page you are looking for could not be found.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status] || 'An unexpected error occurred.';

    return (
        <GuestLayout>
            <Head title={`${status} - ${title}`} />

            <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden">
                <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="gray" />

                <div className="container px-4 text-center">
                    <FadeIn>
                        <h1 className="font-heading text-8xl font-bold text-primary/20 md:text-9xl">
                            {status}
                        </h1>
                    </FadeIn>

                    <div className="relative -mt-12 md:-mt-20">
                        <TextReveal delay={0.2}>
                            <h2 className="font-heading text-3xl font-bold md:text-5xl">
                                {title}
                            </h2>
                        </TextReveal>

                        <FadeIn delay={0.4}>
                            <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
                                {description}
                            </p>

                            <div className="mt-8 flex justify-center gap-4">
                                <Button asChild size="lg">
                                    <Link href="/">
                                        <Home className="mr-2 h-4 w-4" />
                                        Go Home
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" onClick={() => window.history.back()}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Go Back
                                </Button>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
