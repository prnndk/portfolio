import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ShortLink } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink, Copy, Link2, MousePointerClick } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent
} from '@/components/ui/empty';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface Props {
    shortLinks: {
        data: ShortLink[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Short Links', href: '/admin/short-links' },
];

export default function ShortLinksIndex({ shortLinks }: Props) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id: number) => {
        destroy(`/admin/short-links/${id}`);
    };

    const copyToClipboard = async (shortLink: ShortLink) => {
        const url = `${window.location.origin}/${shortLink.code}`;
        await navigator.clipboard.writeText(url);
        toast.success('Short link copied to clipboard!');
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Short Links" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Short Links</h1>
                        <p className="text-muted-foreground">Manage your shortened URLs</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/short-links/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Short Link
                        </Link>
                    </Button>
                </div>

                {/* Table Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Short Links</CardTitle>
                        <CardDescription>
                            {shortLinks.data.length} short link{shortLinks.data.length !== 1 ? 's' : ''} total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {shortLinks.data.length === 0 ? (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Link2 className="h-6 w-6" />
                                    </EmptyMedia>
                                    <EmptyTitle>No short links yet</EmptyTitle>
                                    <EmptyDescription>
                                        Create your first short link to start sharing URLs.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button asChild>
                                        <Link href="/admin/short-links/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Short Link
                                        </Link>
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Short Link</TableHead>
                                            <TableHead className="hidden sm:table-cell">Original URL</TableHead>
                                            <TableHead className="text-center">Clicks</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="hidden md:table-cell">Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {shortLinks.data.map((link) => (
                                            <TableRow key={link.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                                                                /{link.code}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => copyToClipboard(link)}
                                                            >
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                        {link.title && (
                                                            <p className="text-sm text-muted-foreground">{link.title}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell max-w-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate text-sm text-muted-foreground">
                                                            {link.original_url}
                                                        </span>
                                                        <a
                                                            href={link.original_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="shrink-0"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                                        </a>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{link.clicks}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={link.is_active ? 'default' : 'secondary'}>
                                                        {link.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                    {formatDate(link.created_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                            <Link href={`/admin/short-links/${link.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete short link?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete the short link "/{link.code}".
                                                                        This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(link.id)}
                                                                        disabled={processing}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {shortLinks.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {shortLinks.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
