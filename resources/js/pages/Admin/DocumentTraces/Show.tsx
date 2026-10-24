import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    trace: {
        id: number;
        code: string;
        kind: string;
        mode: string;
        recipient_name: string;
        issuer_name: string | null;
        page_count: number;
        sha256: string | null;
        key_version: number;
        issued_at: string;
        revoked_at: string | null;
        settings: Record<string, unknown>;
    };
    pages: { page_no: number; page_code: string }[];
    verifications: { result: string; matched_by: string | null; created_at: string }[];
}

export default function DocumentTraceShow({ trace, pages, verifications }: Props) {
    const [confirm, setConfirm] = useState(false);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Document Traces', href: '/admin/document-traces' },
        { title: trace.code, href: `/admin/document-traces/${trace.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Trace ${trace.code}`} />
            <div className="flex flex-col gap-6 p-4">
                <Card>
                    <CardHeader className="flex-row items-center justify-between gap-4">
                        <CardTitle className="font-mono">{trace.code}</CardTitle>
                        <div className="flex items-center gap-2">
                            {trace.revoked_at ? <Badge variant="destructive">Revoked</Badge> : <Badge variant="secondary">Active</Badge>}
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/v/${trace.code}`}>Public page</Link>
                            </Button>
                            {!trace.revoked_at &&
                                (confirm ? (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                            router.post(`/admin/document-traces/${trace.id}/revoke`, {}, { onFinish: () => setConfirm(false) })
                                        }
                                    >
                                        Confirm revoke
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => setConfirm(true)}>
                                        Revoke
                                    </Button>
                                ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2 text-sm">
                            <dt className="text-muted-foreground">Prepared for</dt>
                            <dd>{trace.recipient_name}</dd>
                            <dt className="text-muted-foreground">Issued by</dt>
                            <dd>{trace.issuer_name ?? '—'}</dd>
                            <dt className="text-muted-foreground">Type</dt>
                            <dd>
                                {trace.kind} · {trace.mode} · {trace.page_count} page(s)
                            </dd>
                            <dt className="text-muted-foreground">Issued</dt>
                            <dd>{new Date(trace.issued_at).toLocaleString('en-GB')}</dd>
                            <dt className="text-muted-foreground">SHA-256</dt>
                            <dd className="font-mono text-xs break-all">{trace.sha256}</dd>
                            <dt className="text-muted-foreground">Key generation</dt>
                            <dd>{trace.key_version}</dd>
                        </dl>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Page codes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Page</TableHead>
                                        <TableHead>Code</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pages.map((p) => (
                                        <TableRow key={p.page_no}>
                                            <TableCell>{p.page_no}</TableCell>
                                            <TableCell className="font-mono">
                                                {trace.code}-{p.page_code}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Verification log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {verifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nobody has verified this document yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>When</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead>Matched by</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {verifications.map((v, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{new Date(v.created_at).toLocaleString('en-GB')}</TableCell>
                                                <TableCell>{v.result}</TableCell>
                                                <TableCell>{v.matched_by ?? '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
