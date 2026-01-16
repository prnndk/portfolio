import { Head } from '@inertiajs/react';

interface SeoProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    author?: string;
}

export function Seo({
    title,
    description = "Portfolio and personal website highlighting projects, activities, and thoughts.",
    image,
    url,
    type = 'website',
    publishedTime,
    author
}: SeoProps) {

    const appName = import.meta.env.VITE_APP_NAME || 'Portfolio Arya Gading Prinandika';
    const appUrl = import.meta.env.VITE_APP_URL || 'https://aryagading.com';

    // Construct absolute image URL
    const fullImage = image
        ? (image.startsWith('http') ? image : `${appUrl}${image.startsWith('/') ? '' : '/'}${image}`)
        : `${appUrl}/opengraph.png`; // Default OG image

    const fullUrl = url
        ? (url.startsWith('http') ? url : `${appUrl}${url}`)
        : typeof window !== 'undefined' ? window.location.href : appUrl;

    return (
        <Head>
            <title>{title}</title>
            <meta name="description" content={description} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:site_name" content={appName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Article Specific */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && author && (
                <meta property="article:author" content={author} />
            )}
        </Head>
    );
}
