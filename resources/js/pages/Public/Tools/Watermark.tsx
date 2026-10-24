import { PdfProtectTool } from '@/components/doc-trace/pdf-protect-tool';
import { ToolShell } from '@/components/doc-trace/tool-shell';
import { Stamp } from 'lucide-react';

export default function Watermark() {
    return (
        <ToolShell
            title="Watermark & Trace"
            subtitle="Per-page watermark, copyright footer and a hidden trace • 100% private"
            seoTitle="PDF Watermark & Trace – Tilt, Tile, Per-Page Text, Hidden Document ID"
            description="Watermark a PDF with custom text, font, tilt and spacing, a different watermark per page, a copyright footer and an optional hidden trace so you can prove where a shared copy came from. Files never leave your browser."
            url="/tools/watermark"
            icon={Stamp}
        >
            <PdfProtectTool mode="watermark" />
        </ToolShell>
    );
}
