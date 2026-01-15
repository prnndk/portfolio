import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Mail, Trash2, ChevronLeft, ChevronRight, Calendar, Eye } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Contacts', href: '/admin/contacts' },
];

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    status: string;
    created_at: string;
}

interface Props {
    contacts: {
        data: Contact[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export default function ContactsIndex({ contacts }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(`/admin/contacts/${id}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacts" />
            <div className="p-4 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Contacts</h1>
                        <p className="text-muted-foreground">
                            Manage your contact form submissions ({contacts.total})
                        </p>
                    </div>
                </div>

                {contacts.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Mail className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                                No messages yet.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {contacts.data.map((contact) => (
                            <Card key={contact.id} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 bg-muted/30 pb-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-medium">
                                            {contact.name}
                                        </CardTitle>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Mail className="mr-1 h-3 w-3" />
                                            {contact.email}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={contact.status === 'new' ? 'default' : 'secondary'}>
                                            {contact.status}
                                        </Badge>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/contacts/${contact.id}`}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(contact.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed">
                                        {contact.message}
                                    </p>
                                    <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {formatDate(contact.created_at)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {contacts.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {contacts.links.map((link, i) => {
                            if (link.url === null) return null;
                            const isPrev = link.label.includes('Previous');
                            const isNext = link.label.includes('Next');

                            if (isPrev || isNext) {
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="icon"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <Link href={link.url}>
                                            {isPrev ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </Link>
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    asChild
                                >
                                    <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
