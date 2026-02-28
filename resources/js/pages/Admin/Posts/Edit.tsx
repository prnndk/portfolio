import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/ui/file-uploader';
import { InputField, SelectField, SwitchField, TextareaField } from '@/components/ui/form-components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppearance } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Post, type Tag } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { ArrowLeft, ExternalLink, Eye, FileText, ImagePlus, Link as LinkIcon, Plus, Save, Settings, Tag as TagIcon, Upload, X } from 'lucide-react';
import { type FormEvent, useCallback, useRef, useState } from 'react';

interface Props {
    post: Post;
    availableTags: Tag[];
}

const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

export default function PostsEdit({ post, availableTags }: Props) {
    const { appearance } = useAppearance();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Posts', href: '/admin/posts' },
        { title: 'Edit', href: `/admin/posts/${post.id}/edit` },
    ];

    // Determine initial image source based on existing data
    const initialImageSource = post.featured_image_url ? 'url' : 'upload';
    const [imageSource, setImageSource] = useState<'upload' | 'url'>(initialImageSource);
    const [isUploading, setIsUploading] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');
    const tagInputRef = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        post: submitPost,
        processing,
        errors,
    } = useForm({
        _method: 'PUT',
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        featured_image: null as File | null,
        featured_image_url: post.featured_image_url || '',
        image_source: initialImageSource as 'upload' | 'url',
        status: post.status,
        published_at: post.published_at ? post.published_at.slice(0, 16) : '',
        is_active: post.is_active,
        tags: (post.tags ?? []).map((t) => t.id) as number[],
        new_tags: [] as string[],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submitPost(`/admin/posts/${post.id}`);
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

    const toggleExistingTag = (tagId: number) => {
        setData('tags', data.tags.includes(tagId) ? data.tags.filter((id) => id !== tagId) : [...data.tags, tagId]);
    };

    const addNewTag = () => {
        const name = newTagInput.trim().replace(/,+$/, '');
        if (!name || data.new_tags.includes(name)) return;
        setData('new_tags', [...data.new_tags, name]);
        setNewTagInput('');
        tagInputRef.current?.focus();
    };

    const removeNewTag = (name: string) => {
        setData(
            'new_tags',
            data.new_tags.filter((t) => t !== name),
        );
    };

    // Get the current featured image URL for display
    const getCurrentFeaturedImage = () => {
        if (post.featured_image) {
            return `/storage/${post.featured_image}`;
        }
        if (post.featured_image_url) {
            return post.featured_image_url;
        }
        return null;
    };

    const currentFeaturedImage = getCurrentFeaturedImage();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${post.title}`} />
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
                            <h1 className="text-2xl font-bold">Edit Post</h1>
                            <p className="line-clamp-1 text-sm text-muted-foreground">{post.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {post.status === 'published' && (
                            <Button variant="outline" asChild>
                                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Post
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/admin/posts">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing || isUploading}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Update Post'}
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
                                    <CardDescription>Edit your blog post content</CardDescription>
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
                                                commands={[...commands.getCommands(), commands.divider, imageUploadCommand]}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Tip: Use the image upload button in the toolbar to add images directly to your content.
                                        </p>
                                        {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
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
                                    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">Search Preview</p>
                                        <div className="space-y-1">
                                            <h4 className="line-clamp-1 text-lg font-semibold text-primary">{data.title || 'Post Title'}</h4>
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {data.excerpt || 'Your post excerpt will appear here...'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Current Featured Image */}
                            {currentFeaturedImage && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Current Image</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-hidden rounded-lg border border-border">
                                            <img src={currentFeaturedImage} alt={post.title} className="w-full object-cover" />
                                        </div>
                                        {post.featured_image_url && (
                                            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                <LinkIcon className="h-3 w-3" />
                                                External URL
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

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

                            {/* Replace Featured Image */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Replace Image</CardTitle>
                                    <CardDescription>Upload a new featured image or use an external URL</CardDescription>
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
                                    <p className="text-xs text-muted-foreground">Leave empty to keep the current image</p>
                                    {errors.featured_image && <p className="text-sm text-destructive">{errors.featured_image}</p>}
                                    {errors.featured_image_url && <p className="text-sm text-destructive">{errors.featured_image_url}</p>}
                                </CardContent>
                            </Card>

                            {/* Tags Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <TagIcon className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Tags</CardTitle>
                                    </div>
                                    <CardDescription>Help readers discover related content</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Existing tags */}
                                    {availableTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {availableTags.map((tag) => (
                                                <Badge
                                                    key={tag.id}
                                                    variant={data.tags.includes(tag.id) ? 'default' : 'outline'}
                                                    className="cursor-pointer transition-colors"
                                                    onClick={() => toggleExistingTag(tag.id)}
                                                >
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* New tags pending creation */}
                                    {data.new_tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.new_tags.map((name) => (
                                                <Badge key={name} variant="secondary" className="gap-1 pr-1">
                                                    {name}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewTag(name)}
                                                        className="ml-0.5 rounded-full hover:text-destructive"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* New tag input */}
                                    <div className="flex gap-2">
                                        <Input
                                            ref={tagInputRef}
                                            value={newTagInput}
                                            onChange={(e) => setNewTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ',') {
                                                    e.preventDefault();
                                                    addNewTag();
                                                }
                                            }}
                                            placeholder="Add new tag..."
                                            className="h-8 text-sm"
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addNewTag} className="h-8">
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Press Enter or comma to add a new tag</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
