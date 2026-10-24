import { PdfProtectTool } from '@/components/doc-trace/pdf-protect-tool';
import { ToolShell } from '@/components/doc-trace/tool-shell';
import { PenLine } from 'lucide-react';

export default function PdfSign() {
    return (
        <ToolShell
            title="Sign PDF"
            subtitle="Place your signature anywhere • optional integrity seal • 100% private"
            seoTitle="Sign PDF Online – Place a PNG Signature Anywhere on a Document"
            description="Place a PNG or hand-drawn signature anywhere on a PDF, on one page or all of them, with an optional integrity seal and QR code that proves the document was not altered. Files never leave your browser."
            url="/tools/pdf-sign"
            icon={PenLine}
        >
            <PdfProtectTool mode="sign" />
        </ToolShell>
    );
}
