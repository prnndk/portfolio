import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem, type ShortLink } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Link2, Settings, MousePointerClick, Copy, ExternalLink } from 'lucide-react';
import { type FormEvent } from 'react';
import { InputField, SwitchField } from '@/components/ui/form-components';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Props {
    shortLink: ShortLink;
}

export default function ShortLinksEdit({ shortLink }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Short Links', href: '/admin/short-links' },
        { title: 'Edit', href: `/admin/short-links/${shortLink.id}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        original_url: shortLink.original_url,
        title: shortLink.title || '',
        code: shortLink.code,
        is_active: shortLink.is_active,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/short-links/${shortLink.id}`);
    };

    const shortUrl = `${window.location.origin}/${data.code}`;

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(shortUrl);
        toast.success('Short link copied to clipboard!');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${shortLink.code}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/short-links">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Short Link</h1>
                            <p className="text-sm text-muted-foreground font-mono">/{shortLink.code}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/short-links">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Update Link'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* URL Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Link2 className="h-5 w-5 text-primary" />
                                        <CardTitle>URL Details</CardTitle>
                                    </div>
                                    <CardDescription>Update the destination URL</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputField
                                        id="original_url"
                                        label="Original URL"
                                        type="url"
                                        required
                                        value={data.original_url}
                                        onChange={(e) => setData('original_url', e.target.value)}
                                        placeholder="https://example.com/very-long-url-that-needs-shortening"
                                        error={errors.original_url}
                                    />

                                    <InputField
                                        id="title"
                                        label="Title (Optional)"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="My awesome link"
                                        description="A friendly name to help you remember this link"
                                        error={errors.title}
                                    />

                                    <div className="space-y-2">
                                        <Label htmlFor="code">Short Code</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">{window.location.origin}/</span>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ''))}
                                                placeholder="my-custom-link"
                                                className="font-mono"
                                            />
                                        </div>
                                        {errors.code && (
                                            <p className="text-sm text-destructive">{errors.code}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Only letters, numbers, dashes, and underscores. Min 3 characters.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Stats Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <MousePointerClick className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Statistics</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-4">
                                        <div className="text-4xl font-bold text-primary">{shortLink.clicks}</div>
                                        <p className="text-sm text-muted-foreground mt-1">Total clicks</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Settings */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Settings</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <SwitchField
                                        id="is_active"
                                        label="Active"
                                        description="Disable to prevent redirects"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="border-dashed">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start" onClick={copyToClipboard}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Copy Short Link
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Test Redirect
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
