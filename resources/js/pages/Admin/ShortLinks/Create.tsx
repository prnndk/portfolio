import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Link2, Settings, Sparkles } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { InputField, SwitchField } from '@/components/ui/form-components';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Short Links', href: '/admin/short-links' },
    { title: 'Create', href: '/admin/short-links/create' },
];

export default function ShortLinksCreate() {
    const [useCustomCode, setUseCustomCode] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        original_url: '',
        title: '',
        code: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/short-links');
    };

    const previewUrl = `${window.location.origin}/${data.code || 'xxxxx'}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Short Link" />
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
                            <h1 className="text-2xl font-bold">Create Short Link</h1>
                            <p className="text-sm text-muted-foreground">Shorten a URL for easy sharing</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/short-links">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Link'}
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
                                    <CardDescription>Enter the URL you want to shorten</CardDescription>
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
                                </CardContent>
                            </Card>

                            {/* Custom Code Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            <CardTitle>Custom Short Code</CardTitle>
                                        </div>
                                        <SwitchField
                                            id="use_custom_code"
                                            label=""
                                            checked={useCustomCode}
                                            onCheckedChange={setUseCustomCode}
                                        />
                                    </div>
                                    <CardDescription>Use a custom code instead of auto-generated</CardDescription>
                                </CardHeader>
                                {useCustomCode && (
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Custom Code</Label>
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
                                )}
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
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

                            {/* Preview Card */}
                            <Card className="border-dashed">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg bg-muted/50 p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Your short link will be:</p>
                                        <code className="text-sm font-mono text-primary break-all">
                                            {previewUrl}
                                        </code>
                                        {data.original_url && (
                                            <>
                                                <p className="text-xs text-muted-foreground mt-3 mb-1">Redirects to:</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {data.original_url}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
