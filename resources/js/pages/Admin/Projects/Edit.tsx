import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem, type Project } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Folder, Link as LinkIcon, Image, Settings, ExternalLink, X, Plus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { InputField, TextareaField, SwitchField, TagInput } from '@/components/ui/form-components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface Props {
    project: Project;
}

export default function ProjectsEdit({ project }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Projects', href: '/admin/projects' },
        { title: 'Edit', href: `/admin/projects/${project.id}/edit` },
    ];

    const [existingGallery, setExistingGallery] = useState(project.gallery || []);
    const [existingGalleryUrls, setExistingGalleryUrls] = useState(project.gallery_urls || []);
    const [imageTab, setImageTab] = useState<'upload' | 'url'>(project.image_url ? 'url' : 'upload');
    const [galleryTab, setGalleryTab] = useState<'upload' | 'url'>('upload');
    const [newGalleryUrl, setNewGalleryUrl] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: project.title,
        description: project.description,
        image: null as File | null,
        image_url: project.image_url || '',
        gallery: [] as File[],
        gallery_urls: [] as string[],
        remove_gallery: [] as string[],
        remove_gallery_urls: [] as string[],
        tech_tags: project.tech_tags || [],
        url: project.url || '',
        github_url: project.github_url || '',
        featured: project.featured,
        is_active: project.is_active,
        sort_order: project.sort_order,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/projects/${project.id}`);
    };

    const removeExistingImage = (path: string) => {
        setExistingGallery(existingGallery.filter((p) => p !== path));
        setData('remove_gallery', [...data.remove_gallery, path]);
    };

    const removeExistingGalleryUrl = (url: string) => {
        setExistingGalleryUrls(existingGalleryUrls.filter((u) => u !== url));
        setData('remove_gallery_urls', [...data.remove_gallery_urls, url]);
    };

    const isValidUrl = (string: string) => {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const addGalleryUrl = () => {
        if (!newGalleryUrl) {
            toast.error('Please enter a URL');
            return;
        }
        if (!isValidUrl(newGalleryUrl)) {
            toast.error('Please enter a valid URL (must start with http:// or https://)');
            return;
        }
        if (data.gallery_urls.includes(newGalleryUrl)) {
            toast.error('This URL is already in the gallery');
            return;
        }
        setData('gallery_urls', [...data.gallery_urls, newGalleryUrl]);
        setNewGalleryUrl('');
    };

    const removeNewGalleryUrl = (url: string) => {
        setData('gallery_urls', data.gallery_urls.filter((u) => u !== url));
    };

    const getPreviewImage = () => {
        if (data.image) {
            return URL.createObjectURL(data.image);
        }
        if (data.image_url) {
            return data.image_url;
        }
        if (project.image) {
            return `/storage/${project.image}`;
        }
        if (project.image_url) {
            return project.image_url;
        }
        return null;
    };

    const getCurrentImageDisplay = () => {
        if (project.image) {
            return `/storage/${project.image}`;
        }
        if (project.image_url) {
            return project.image_url;
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${project.title}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/projects">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Project</h1>
                            <p className="text-sm text-muted-foreground line-clamp-1">{project.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {project.is_active && (
                            <Button variant="outline" asChild>
                                <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Project
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/admin/projects">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Update Project'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Project Details */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Folder className="h-5 w-5 text-primary" />
                                        <CardTitle>Project Details</CardTitle>
                                    </div>
                                    <CardDescription>Basic information about your project</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputField
                                        id="title"
                                        label="Project Title"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="My Awesome Project"
                                        className="text-lg font-medium"
                                        error={errors.title}
                                    />

                                    <TextareaField
                                        id="description"
                                        label="Description"
                                        required
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe what this project does..."
                                        rows={5}
                                        error={errors.description}
                                    />

                                    <TagInput
                                        label="Tech Stack"
                                        tags={data.tech_tags}
                                        onTagsChange={(tags) => setData('tech_tags', tags)}
                                        placeholder="e.g., React, TypeScript, Node.js..."
                                        description="Press Enter or click Add to add a tag"
                                    />
                                </CardContent>
                            </Card>

                            {/* Links */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-primary" />
                                        <CardTitle>Project Links</CardTitle>
                                    </div>
                                    <CardDescription>Where can people view or access this project? (Optional - leave empty for private projects)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InputField
                                            id="url"
                                            label="Live Demo URL"
                                            type="url"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            placeholder="https://myproject.com"
                                            error={errors.url}
                                        />

                                        <InputField
                                            id="github_url"
                                            label="GitHub Repository"
                                            type="url"
                                            value={data.github_url}
                                            onChange={(e) => setData('github_url', e.target.value)}
                                            placeholder="https://github.com/username/repo"
                                            error={errors.github_url}
                                            description="Leave empty if private"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Media */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Image className="h-5 w-5 text-primary" />
                                        <CardTitle>Media</CardTitle>
                                    </div>
                                    <CardDescription>Update images for your project</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Current Featured Image */}
                                    {getCurrentImageDisplay() && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Current Featured Image</label>
                                            <div className="overflow-hidden rounded-lg border border-border">
                                                <img
                                                    src={getCurrentImageDisplay()!}
                                                    alt={project.title}
                                                    className="max-h-48 w-full object-cover"
                                                />
                                            </div>
                                            {project.image_url && (
                                                <p className="text-xs text-muted-foreground">Using external URL</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Replace Featured Image */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Replace Featured Image</label>
                                        <Tabs value={imageTab} onValueChange={(v) => setImageTab(v as 'upload' | 'url')}>
                                            <TabsList className="mb-2">
                                                <TabsTrigger value="upload">Upload File</TabsTrigger>
                                                <TabsTrigger value="url">Use URL</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="upload">
                                                <FileUploader
                                                    value={data.image ? [data.image] : []}
                                                    onValueChange={(files) => {
                                                        setData('image', files[0] || null);
                                                        if (files[0]) setData('image_url', '');
                                                    }}
                                                    maxFiles={1}
                                                    description="Upload a new featured image"
                                                />
                                            </TabsContent>
                                            <TabsContent value="url">
                                                <InputField
                                                    id="image_url"
                                                    label=""
                                                    type="url"
                                                    value={data.image_url}
                                                    onChange={(e) => {
                                                        setData('image_url', e.target.value);
                                                        if (e.target.value) setData('image', null);
                                                    }}
                                                    placeholder="https://example.com/image.jpg"
                                                    error={errors.image_url}
                                                    description="Enter a direct URL to an image"
                                                />
                                            </TabsContent>
                                        </Tabs>
                                        {errors.image && (
                                            <p className="text-sm text-destructive">{errors.image}</p>
                                        )}
                                    </div>

                                    {/* Existing Gallery (Uploaded Files) */}
                                    {existingGallery.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Current Gallery - Uploaded ({existingGallery.length} images)</label>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                                {existingGallery.map((img, i) => (
                                                    <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-border">
                                                        <img src={`/storage/${img}`} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                                            onClick={() => removeExistingImage(img)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Existing Gallery URLs */}
                                    {existingGalleryUrls.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Current Gallery - URLs ({existingGalleryUrls.length} images)</label>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                                {existingGalleryUrls.map((url, i) => (
                                                    <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-border">
                                                        <img src={url} alt={`Gallery URL ${i + 1}`} className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                                            onClick={() => removeExistingGalleryUrl(url)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Add to Gallery */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Add to Gallery</label>
                                        <Tabs value={galleryTab} onValueChange={(v) => setGalleryTab(v as 'upload' | 'url')}>
                                            <TabsList className="mb-2">
                                                <TabsTrigger value="upload">Upload Files</TabsTrigger>
                                                <TabsTrigger value="url">Use URLs</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="upload">
                                                <FileUploader
                                                    value={data.gallery}
                                                    onValueChange={(files) => setData('gallery', files)}
                                                    multiple
                                                    description="Upload additional images"
                                                />
                                            </TabsContent>
                                            <TabsContent value="url">
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <InputField
                                                            id="new_gallery_url"
                                                            label=""
                                                            type="url"
                                                            value={newGalleryUrl}
                                                            onChange={(e) => setNewGalleryUrl(e.target.value)}
                                                            placeholder="https://example.com/screenshot.jpg"
                                                            className="flex-1"
                                                        />
                                                        <Button type="button" onClick={addGalleryUrl} variant="outline" className="mt-auto">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {data.gallery_urls.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                                            {data.gallery_urls.map((url, i) => (
                                                                <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                                                                    <img src={url} alt={`New Gallery ${i + 1}`} className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                                                        onClick={() => removeNewGalleryUrl(url)}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                        {errors.gallery && (
                                            <p className="text-sm text-destructive">{errors.gallery}</p>
                                        )}
                                        {/* Display gallery URL errors */}
                                        {Object.keys(errors).filter(k => k.startsWith('gallery_urls')).map((key) => (
                                            <p key={key} className="text-sm text-destructive">{(errors as Record<string, string>)[key]}</p>
                                        ))}
                                    </div>
                                </CardContent>
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
                                <CardContent className="space-y-4">
                                    <InputField
                                        id="sort_order"
                                        label="Sort Order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        description="Lower numbers appear first"
                                    />

                                    <SwitchField
                                        id="featured"
                                        label="Featured Project"
                                        description="Highlight this on your homepage"
                                        checked={data.featured}
                                        onCheckedChange={(checked) => setData('featured', checked)}
                                    />

                                    <SwitchField
                                        id="is_active"
                                        label="Active"
                                        description="Make this project visible on your site"
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
                                    <div className="overflow-hidden rounded-lg border border-border bg-background">
                                        <div className="aspect-video bg-muted flex items-center justify-center">
                                            {getPreviewImage() ? (
                                                <img
                                                    src={getPreviewImage()!}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Image className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-semibold line-clamp-1">
                                                {data.title || 'Project Title'}
                                            </h4>
                                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                {data.description || 'Your project description...'}
                                            </p>
                                            {data.tech_tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {data.tech_tags.slice(0, 3).map((tag) => (
                                                        <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {data.tech_tags.length > 3 && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            +{data.tech_tags.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
