import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileCheck2 } from 'lucide-react';

interface Row {
    id: number;
    code: string;
    kind: 'pdf' | 'image';
    mode: string;
    recipient_name: string;
    page_count: number;
    issued_at: string;
    revoked: boolean;
    by_admin: boolean;
}

interface Props {
    traces: {
        data: Row[];
        links: { url: string | null; label: string; active: boolean }[];
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Document Traces', href: '/admin/document-traces' },
];

export default function DocumentTracesIndex({ traces }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Document Traces" />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCheck2 className="h-5 w-5" />
                            Document traces
                        </CardTitle>
                        <CardDescription>
                            Every document registered through the Watermark, Sign and Image tools. Records are permanent and can only be revoked.
                            Private details stay locked with each creator's passphrase.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {traces.data.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Nothing registered yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Prepared for</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Issued</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {traces.data.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-mono">{t.code}</TableCell>
                                            <TableCell>{t.recipient_name}</TableCell>
                                            <TableCell>
                                                {t.kind === 'pdf' ? `PDF · ${t.page_count}p` : 'Image'} · {t.mode}
                                            </TableCell>
                                            <TableCell>{new Date(t.issued_at).toLocaleDateString('en-GB')}</TableCell>
                                            <TableCell className="space-x-1">
                                                {t.revoked ? <Badge variant="destructive">Revoked</Badge> : <Badge variant="secondary">Active</Badge>}
                                                {t.by_admin && <Badge variant="outline">Admin</Badge>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={`/admin/document-traces/${t.id}`}>Open</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        <Pagination paginator={traces} className="mt-6" />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
