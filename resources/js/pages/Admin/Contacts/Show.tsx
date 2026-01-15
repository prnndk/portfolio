import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Mail, Trash2, ArrowLeft, Calendar, User, MessageSquare } from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    email: string;
    message: string;
    status: string;
    created_at: string;
}

interface Props {
    contact: Contact;
}

export default function ContactsShow({ contact }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Contacts', href: '/admin/contacts' },
        { title: contact.name, href: `/admin/contacts/${contact.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this message?')) {
            router.delete(`/admin/contacts/${contact.id}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Message from ${contact.name}`} />

            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <div className="mb-6">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent" asChild>
                        <Link href="/admin/contacts">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Contacts
                        </Link>
                    </Button>
                </div>

                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Message Details</h1>
                        <p className="text-muted-foreground">
                            Received on {formatDate(contact.created_at)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="border-b bg-muted/40">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {contact.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {contact.email}
                                </CardDescription>
                            </div>
                            <div className="flex sm:justify-end">
                                <Badge variant={contact.status === 'new' ? 'default' : 'secondary'} className="h-fit">
                                    {contact.status.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            Message Content:
                        </div>
                        <div className="rounded-md border bg-card p-4 shadow-sm">
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {contact.message}
                            </p>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button asChild>
                                <a href={`mailto:${contact.email}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Reply via Email
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
