import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Eye, FileText, Settings, Upload, Link as LinkIcon, ImagePlus } from 'lucide-react';
import { type FormEvent, useState, useCallback } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useAppearance } from '@/hooks/use-appearance';
import { InputField, TextareaField, SelectField, SwitchField } from '@/components/ui/form-components';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Posts', href: '/admin/posts' },
    { title: 'Create', href: '/admin/posts/create' },
];

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

export default function PostsCreate() {
    const { appearance } = useAppearance();
    const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
    const [isUploading, setIsUploading] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        excerpt: '',
        featured_image: null as File | null,
        featured_image_url: '',
        image_source: 'upload' as 'upload' | 'url',
        status: 'draft' as 'draft' | 'published' | 'archived',
        published_at: '',
        is_active: true as boolean,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/posts');
    };

    // Handle image upload for markdown editor
    const handleImageUpload = useCallback(async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/admin/upload/image', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        return result.url;
    }, []);

    // Custom image upload command for MDEditor
    const imageUploadCommand = {
        name: 'image-upload',
        keyCommand: 'image-upload',
        buttonProps: { 'aria-label': 'Upload image' },
        icon: <ImagePlus className="h-4 w-4" />,
        execute: async (_state: unknown, api: { replaceSelection: (text: string) => void }) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                setIsUploading(true);
                try {
                    const url = await handleImageUpload(file);
                    api.replaceSelection(`![${file.name}](${url})`);
                } catch {
                    alert('Failed to upload image. Please try again.');
                } finally {
                    setIsUploading(false);
                }
            };
            input.click();
        },
    };

    // Word count for content
    const wordCount = data.content.trim() ? data.content.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200);

    const handleImageSourceChange = (source: 'upload' | 'url') => {
        setImageSource(source);
        setData('image_source', source);
        // Clear the other source when switching
        if (source === 'upload') {
            setData('featured_image_url', '');
        } else {
            setData('featured_image', null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />
            <div className="flex flex-col gap-6 p-4 md:p-6" data-color-mode={appearance}>
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/posts">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Create New Post</h1>
                            <p className="text-sm text-muted-foreground">Write and publish a new blog post</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/posts">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing || isUploading}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Publish Post'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Title & Content Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <CardTitle>Content</CardTitle>
                                    </div>
                                    <CardDescription>Write your blog post content in Markdown</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputField
                                        id="title"
                                        label="Post Title"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter an engaging title..."
                                        className="text-lg font-medium"
                                        error={errors.title}
                                    />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">
                                                Content <span className="text-destructive">*</span>
                                            </label>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                {isUploading && <span className="text-primary">Uploading...</span>}
                                                <span>{wordCount} words</span>
                                                <span>~{readingTime} min read</span>
                                            </div>
                                        </div>
                                        <div className="min-h-[500px] overflow-hidden rounded-lg border border-input">
                                            <MDEditor
                                                value={data.content}
                                                onChange={(val) => setData('content', val || '')}
                                                height={500}
                                                preview="edit"
                                                commands={[
                                                    ...commands.getCommands(),
                                                    commands.divider,
                                                    imageUploadCommand,
                                                ]}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Tip: Use the image upload button in the toolbar to add images directly to your content.
                                        </p>
                                        {errors.content && (
                                            <p className="text-sm text-destructive">{errors.content}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SEO Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-primary" />
                                        <CardTitle>SEO & Preview</CardTitle>
                                    </div>
                                    <CardDescription>Optimize how your post appears in search results</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TextareaField
                                        id="excerpt"
                                        label="Excerpt / Meta Description"
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        placeholder="Write a compelling summary for search engines and social media..."
                                        rows={3}
                                        description="Recommended: 150-160 characters for optimal SEO"
                                    />

                                    {/* Preview Card */}
                                    {(data.title || data.excerpt) && (
                                        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
                                            <p className="mb-2 text-xs font-medium text-muted-foreground">Search Preview</p>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-semibold text-primary line-clamp-1">
                                                    {data.title || 'Post Title'}
                                                </h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {data.excerpt || 'Your post excerpt will appear here...'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Publish Settings */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Publish Settings</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <SelectField
                                        id="status"
                                        label="Status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'draft' | 'published' | 'archived')}
                                        options={statusOptions}
                                    />

                                    <InputField
                                        id="published_at"
                                        label="Publish Date"
                                        type="datetime-local"
                                        value={data.published_at}
                                        onChange={(e) => setData('published_at', e.target.value)}
                                        description="Leave empty to publish immediately"
                                    />

                                    <SwitchField
                                        id="is_active"
                                        label="Active"
                                        description="Make this post visible on your site"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </CardContent>
                            </Card>

                            {/* Featured Image */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Featured Image</CardTitle>
                                    <CardDescription>This image will appear at the top of your post</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Tabs value={imageSource} onValueChange={(v) => handleImageSourceChange(v as 'upload' | 'url')}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="upload" className="flex items-center gap-2">
                                                <Upload className="h-4 w-4" />
                                                Upload
                                            </TabsTrigger>
                                            <TabsTrigger value="url" className="flex items-center gap-2">
                                                <LinkIcon className="h-4 w-4" />
                                                URL
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="upload" className="space-y-2">
                                            <FileUploader
                                                value={data.featured_image ? [data.featured_image] : []}
                                                onValueChange={(files) => setData('featured_image', files[0] || null)}
                                                maxFiles={1}
                                                description="Drag & drop or click to upload"
                                            />
                                        </TabsContent>
                                        <TabsContent value="url" className="space-y-2">
                                            <Label htmlFor="featured_image_url">Image URL</Label>
                                            <Input
                                                id="featured_image_url"
                                                value={data.featured_image_url}
                                                onChange={(e) => setData('featured_image_url', e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                            />
                                            {data.featured_image_url && (
                                                <div className="mt-2 overflow-hidden rounded-lg border border-border">
                                                    <img
                                                        src={data.featured_image_url}
                                                        alt="Preview"
                                                        className="w-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                    <p className="text-xs text-muted-foreground">
                                        Recommended: 1200x630px for optimal social sharing
                                    </p>
                                    {errors.featured_image && (
                                        <p className="text-sm text-destructive">{errors.featured_image}</p>
                                    )}
                                    {errors.featured_image_url && (
                                        <p className="text-sm text-destructive">{errors.featured_image_url}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
