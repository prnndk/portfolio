import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem, type Favorite } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Star, Link as LinkIcon, Image, Settings, Film, Music, BookOpen, Trash2 } from 'lucide-react';
import { type FormEvent } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { InputField, TextareaField, SwitchField } from '@/components/ui/form-components';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Favorites', href: '/admin/favorites' },
    { title: 'Edit', href: '#' },
];

interface Props {
    favorite: Favorite;
}

const typeOptions = [
    { value: 'movie', label: 'Movie', icon: Film },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'book', label: 'Book', icon: BookOpen },
];

const ratingOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} / 10`,
}));

export default function FavoritesEdit({ favorite }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: favorite.title,
        type: favorite.type as 'movie' | 'music' | 'book',
        description: favorite.description || '',
        image: null as File | null,
        creator: favorite.creator || '',
        year: favorite.year || '',
        genre: favorite.genre || '',
        content: favorite.content || '',
        external_url: favorite.external_url || '',
        rating: favorite.rating ? String(favorite.rating) : '',
        is_active: favorite.is_active,
        sort_order: favorite.sort_order,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/favorites/${favorite.id}`);
    };

    const getCreatorLabel = () => {
        switch (data.type) {
            case 'movie': return 'Director';
            case 'music': return 'Artist';
            case 'book': return 'Author';
            default: return 'Creator';
        }
    };

    const currentImage = data.image
        ? URL.createObjectURL(data.image)
        : favorite.image
            ? `/storage/${favorite.image}`
            : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${favorite.title}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/favorites">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Favorite</h1>
                            <p className="text-sm text-muted-foreground">Update "{favorite.title}"</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/favorites">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Update Favorite'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-primary" />
                                        <CardTitle>Basic Information</CardTitle>
                                    </div>
                                    <CardDescription>What's your favorite?</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Type Selection */}
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {typeOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setData('type', option.value as 'movie' | 'music' | 'book')}
                                                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${data.type === option.value
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50'
                                                        }`}
                                                >
                                                    <option.icon className={`h-6 w-6 ${data.type === option.value ? 'text-primary' : 'text-muted-foreground'
                                                        }`} />
                                                    <span className={`text-sm font-medium ${data.type === option.value ? 'text-primary' : 'text-muted-foreground'
                                                        }`}>
                                                        {option.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <InputField
                                        id="title"
                                        label="Title"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter the title"
                                        className="text-lg font-medium"
                                        error={errors.title}
                                    />

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InputField
                                            id="creator"
                                            label={getCreatorLabel()}
                                            value={data.creator}
                                            onChange={(e) => setData('creator', e.target.value)}
                                            placeholder={`Enter ${getCreatorLabel().toLowerCase()} name`}
                                            error={errors.creator}
                                        />

                                        <InputField
                                            id="year"
                                            label="Year"
                                            value={data.year}
                                            onChange={(e) => setData('year', e.target.value)}
                                            placeholder="e.g., 2024"
                                            error={errors.year}
                                        />
                                    </div>

                                    <InputField
                                        id="genre"
                                        label="Genre"
                                        value={data.genre}
                                        onChange={(e) => setData('genre', e.target.value)}
                                        placeholder="e.g., Sci-Fi, Rock, Fiction"
                                        error={errors.genre}
                                    />

                                    <TextareaField
                                        id="description"
                                        label="Short Description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="A brief description that appears in the card"
                                        rows={3}
                                        error={errors.description}
                                    />

                                    <TextareaField
                                        id="content"
                                        label="Extended Review/Content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder="Write a detailed review or why this is your favorite..."
                                        rows={6}
                                        error={errors.content}
                                    />
                                </CardContent>
                            </Card>

                            {/* Link */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-primary" />
                                        <CardTitle>External Link</CardTitle>
                                    </div>
                                    <CardDescription>Link to more information</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <InputField
                                        id="external_url"
                                        label="URL"
                                        type="url"
                                        value={data.external_url}
                                        onChange={(e) => setData('external_url', e.target.value)}
                                        placeholder="https://imdb.com/... or https://spotify.com/..."
                                        error={errors.external_url}
                                    />
                                </CardContent>
                            </Card>

                            {/* Media */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Image className="h-5 w-5 text-primary" />
                                        <CardTitle>Cover Image</CardTitle>
                                    </div>
                                    <CardDescription>Add a poster, album art, or book cover</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {favorite.image && !data.image && (
                                        <div className="mb-4">
                                            <p className="mb-2 text-sm text-muted-foreground">Current image:</p>
                                            <div className="relative inline-block">
                                                <img
                                                    src={`/storage/${favorite.image}`}
                                                    alt={favorite.title}
                                                    className="h-32 w-auto rounded-lg object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <FileUploader
                                        value={data.image ? [data.image] : []}
                                        onValueChange={(files) => setData('image', files[0] || null)}
                                        maxFiles={1}
                                        description="Upload a new image to replace the current one"
                                    />
                                    {errors.image && (
                                        <p className="mt-2 text-sm text-destructive">{errors.image}</p>
                                    )}
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
                                    <div className="space-y-2">
                                        <Label>Rating</Label>
                                        <Select
                                            value={data.rating}
                                            onValueChange={(value) => setData('rating', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select rating" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ratingOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <InputField
                                        id="sort_order"
                                        label="Sort Order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        description="Lower numbers appear first"
                                    />

                                    <SwitchField
                                        id="is_active"
                                        label="Active"
                                        description="Make this favorite visible on your site"
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
                                        <div className="aspect-[16/10] bg-muted flex items-center justify-center">
                                            {currentImage ? (
                                                <img
                                                    src={currentImage}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    {data.type === 'movie' && <Film className="h-8 w-8" />}
                                                    {data.type === 'music' && <Music className="h-8 w-8" />}
                                                    {data.type === 'book' && <BookOpen className="h-8 w-8" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <div className="mb-1 flex items-center gap-2">
                                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                    {data.type.charAt(0).toUpperCase() + data.type.slice(1)}
                                                </span>
                                                {data.rating && (
                                                    <span className="flex items-center gap-0.5 text-[10px]">
                                                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                                                        {data.rating}/10
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold line-clamp-1">
                                                {data.title || 'Title'}
                                            </h4>
                                            {data.creator && (
                                                <p className="text-xs text-muted-foreground">
                                                    {data.creator}
                                                </p>
                                            )}
                                            {data.description && (
                                                <p className="mt-1 text-[10px] text-muted-foreground line-clamp-2">
                                                    {data.description}
                                                </p>
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
