import { Button } from '@/components/ui/button';
import { FONTS, type FontId } from '@/lib/doc-trace/fonts';
import { type PageRule, type ProtectSettings, type TraceMode, type WatermarkStyle } from '@/lib/doc-trace/template';
import { Plus, Trash2 } from 'lucide-react';
import { Check, Field, Panel, Range, Segmented, inputCls } from './fields';

const VARIABLES = ['recipient', 'issuer', 'date', 'year', 'page', 'pages', 'code', 'pageCode'];
const SPACING = [
    { label: 'Tight', gapX: 0.15, gapY: 0.6 },
    { label: 'Normal', gapX: 0.6, gapY: 2.2 },
    { label: 'Loose', gapX: 1.4, gapY: 4.5 },
];
const ANGLES = [0, 30, 45, -45, 90];

interface Props {
    settings: ProtectSettings;
    onChange: (s: ProtectSettings) => void;
    /** A registered (traceable) document: shows the mode switch and the flatten and QR options. */
    traced: boolean;
    /** Editing pictures, not a PDF: flattening does not apply. */
    pictures?: boolean;
    onCustomFont: (bytes: Uint8Array) => void;
    customFontName: string | null;
}

function FontSelect({ value, onChange }: { value: FontId; onChange: (f: FontId) => void }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value as FontId)} className={inputCls}>
            <optgroup label="Built in">
                {FONTS.filter((f) => f.standard).map((f) => (
                    <option key={f.id} value={f.id}>
                        {f.label}
                    </option>
                ))}
            </optgroup>
            <optgroup label="Site fonts">
                {FONTS.filter((f) => !f.standard && f.id !== 'custom').map((f) => (
                    <option key={f.id} value={f.id}>
                        {f.label}
                    </option>
                ))}
            </optgroup>
            <option value="custom">Upload your own (TTF/OTF)</option>
        </select>
    );
}

export function WatermarkControls({ settings, onChange, traced, pictures, onCustomFont, customFontName }: Props) {
    const w = settings.watermark;
    const f = settings.footer;
    const setW = (p: Partial<WatermarkStyle>) => onChange({ ...settings, watermark: { ...w, ...p } });
    const setF = (p: Partial<ProtectSettings['footer']>) => onChange({ ...settings, footer: { ...f, ...p } });
    const setRule = (i: number, p: Partial<PageRule>) =>
        onChange({ ...settings, rules: settings.rules.map((r, n) => (n === i ? { ...r, ...p } : r)) });
    const uploadFont = async (file?: File) => file && onCustomFont(new Uint8Array(await file.arrayBuffer()));

    return (
        <div className="flex flex-col gap-4">
            {traced && (
                <Panel title="What gets added">
                    <Segmented<TraceMode>
                        value={settings.mode}
                        onChange={(mode) => onChange({ ...settings, mode })}
                        options={[
                            { value: 'visible', label: 'Visible' },
                            { value: 'hidden', label: 'Hidden' },
                            { value: 'both', label: 'Both' },
                        ]}
                    />
                    <p className="text-xs text-muted-foreground">
                        {settings.mode === 'visible' && 'Watermark, footer and QR you can see. No hidden layers.'}
                        {settings.mode === 'hidden' &&
                            'Nothing is drawn on the pages. The trace lives in hidden text, file metadata and the hash registry.'}
                        {settings.mode === 'both' && 'Visible watermark plus every hidden layer. Hardest to strip.'}
                    </p>
                    {!pictures && (
                        <Check checked={settings.flatten} onChange={(flatten) => onChange({ ...settings, flatten })}>
                            <span className="font-medium">Flatten pages into pictures</span>
                            <span className="block text-xs text-muted-foreground">
                                The watermark can no longer be deleted in a PDF editor and the hidden pixel watermark is added. Text stops being
                                selectable and the file gets larger.
                            </span>
                        </Check>
                    )}
                    <Check checked={settings.qr} onChange={(qr) => onChange({ ...settings, qr })} disabled={settings.mode === 'hidden'}>
                        QR code on every page that opens the verify page
                    </Check>
                </Panel>
            )}

            <Panel
                title="Watermark"
                aside={
                    <Check checked={w.enabled} onChange={(enabled) => setW({ enabled })}>
                        On
                    </Check>
                }
            >
                <div className={w.enabled ? 'flex flex-col gap-4' : 'pointer-events-none flex flex-col gap-4 opacity-40'}>
                    <Field label="Text" hint="One line per row. Click a variable to insert it.">
                        <textarea
                            value={w.text}
                            onChange={(e) => setW({ text: e.target.value })}
                            rows={2}
                            className={`${inputCls} h-auto py-2 font-mono`}
                        />
                    </Field>
                    <div className="flex flex-wrap gap-1.5">
                        {VARIABLES.map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => setW({ text: `${w.text}{${v}}` })}
                                className="min-h-8 rounded-full border border-border px-2.5 font-mono text-xs transition-colors hover:border-primary hover:text-primary"
                            >
                                {`{${v}}`}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Font">
                            <FontSelect value={w.font} onChange={(font) => setW({ font })} />
                        </Field>
                        <Field label="Colour">
                            <input
                                type="color"
                                value={w.color}
                                onChange={(e) => setW({ color: e.target.value })}
                                className={`${inputCls} cursor-pointer p-1`}
                            />
                        </Field>
                    </div>
                    {w.font === 'custom' && (
                        <Field label="Font file" hint={customFontName ?? 'Choose a .ttf or .otf file. It stays in your browser.'}>
                            <input type="file" accept=".ttf,.otf" onChange={(e) => uploadFont(e.target.files?.[0])} className={inputCls} />
                        </Field>
                    )}

                    <div className="flex flex-col gap-2">
                        <Check checked={w.size === 0} onChange={(auto) => setW({ size: auto ? 0 : 48 })}>
                            Fit text to the page automatically
                        </Check>
                        {w.size > 0 && <Range label="Size" value={w.size} min={8} max={200} unit=" pt" onChange={(size) => setW({ size })} />}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Range label="Tilt" value={w.angle} min={-90} max={90} unit="°" onChange={(angle) => setW({ angle })} />
                        <div className="flex flex-wrap gap-1.5">
                            {ANGLES.map((a) => (
                                <Button
                                    key={a}
                                    type="button"
                                    size="sm"
                                    variant={w.angle === a ? 'default' : 'outline'}
                                    onClick={() => setW({ angle: a })}
                                >
                                    {a}°
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Range
                        label="Opacity"
                        value={Math.round(w.opacity * 100)}
                        min={4}
                        max={100}
                        unit="%"
                        onChange={(v) => setW({ opacity: v / 100 })}
                    />

                    <Field label="Layout">
                        <select value={w.layout} onChange={(e) => setW({ layout: e.target.value as WatermarkStyle['layout'] })} className={inputCls}>
                            <option value="tile">Repeat over the whole page</option>
                            <option value="center">Single, centred</option>
                            <option value="top">Single, near the top</option>
                            <option value="bottom">Single, near the bottom</option>
                            <option value="custom">Single, custom position</option>
                        </select>
                    </Field>

                    {w.layout === 'tile' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <span className="mr-1 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">Spacing</span>
                                {SPACING.map((s) => (
                                    <Button
                                        key={s.label}
                                        type="button"
                                        size="sm"
                                        variant={w.gapX === s.gapX && w.gapY === s.gapY ? 'default' : 'outline'}
                                        onClick={() => setW({ gapX: s.gapX, gapY: s.gapY })}
                                    >
                                        {s.label}
                                    </Button>
                                ))}
                            </div>
                            <Range
                                label="Space between copies, across"
                                value={w.gapX}
                                min={0}
                                max={5}
                                step={0.1}
                                unit="×"
                                onChange={(gapX) => setW({ gapX })}
                            />
                            <Range
                                label="Space between rows"
                                value={w.gapY}
                                min={0}
                                max={8}
                                step={0.1}
                                unit="×"
                                onChange={(gapY) => setW({ gapY })}
                            />
                            <Check checked={w.stagger} onChange={(stagger) => setW({ stagger })}>
                                Stagger every other row
                            </Check>
                        </div>
                    )}
                    {w.layout === 'custom' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Range label="Across" value={Math.round(w.x * 100)} min={0} max={100} unit="%" onChange={(v) => setW({ x: v / 100 })} />
                            <Range label="Down" value={Math.round(w.y * 100)} min={0} max={100} unit="%" onChange={(v) => setW({ y: v / 100 })} />
                        </div>
                    )}
                </div>
            </Panel>

            <Panel
                title="Different on certain pages"
                aside={
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => onChange({ ...settings, rules: [...settings.rules, { range: '1', style: { text: 'DRAFT' } }] })}
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Add rule
                    </Button>
                }
            >
                {settings.rules.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Every page uses the watermark above. Add a rule to change the text or colour on some pages, or to hide it there.
                    </p>
                )}
                {settings.rules.map((r, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[8rem_1fr_auto]">
                            <Field label="Pages" hint="e.g. 1-3, 5">
                                <input value={r.range} onChange={(e) => setRule(i, { range: e.target.value })} className={`${inputCls} font-mono`} />
                            </Field>
                            <Field label="Text on these pages">
                                <input
                                    value={r.style.text ?? ''}
                                    placeholder="Same as above"
                                    onChange={(e) => setRule(i, { style: { ...r.style, text: e.target.value || undefined } })}
                                    disabled={r.style.enabled === false}
                                    className={inputCls}
                                />
                            </Field>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="self-end"
                                aria-label="Remove rule"
                                onClick={() => onChange({ ...settings, rules: settings.rules.filter((_, n) => n !== i) })}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <Check
                                checked={r.style.enabled === false}
                                onChange={(hide) => setRule(i, { style: { ...r.style, enabled: hide ? false : undefined } })}
                            >
                                No watermark on these pages
                            </Check>
                            <label className="flex items-center gap-2 text-sm">
                                Colour
                                <input
                                    type="color"
                                    value={r.style.color ?? w.color}
                                    onChange={(e) => setRule(i, { style: { ...r.style, color: e.target.value } })}
                                    className="h-8 w-10 cursor-pointer rounded border border-border bg-background p-0.5"
                                />
                            </label>
                        </div>
                    </div>
                ))}
            </Panel>

            <Panel
                title="Footer"
                aside={
                    <Check checked={f.enabled} onChange={(enabled) => setF({ enabled })}>
                        On
                    </Check>
                }
            >
                <div className={f.enabled ? 'flex flex-col gap-4' : 'pointer-events-none flex flex-col gap-4 opacity-40'}>
                    <Field label="Copyright line" hint="Says whom the document was prepared for. Shrinks to fit the page width.">
                        <textarea value={f.text} onChange={(e) => setF({ text: e.target.value })} rows={2} className={`${inputCls} h-auto py-2`} />
                    </Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Font">
                            <FontSelect value={f.font} onChange={(font) => setF({ font })} />
                        </Field>
                        <Field label="Align">
                            <Segmented
                                value={f.align}
                                onChange={(align) => setF({ align })}
                                options={[
                                    { value: 'left', label: 'Left' },
                                    { value: 'center', label: 'Centre' },
                                    { value: 'right', label: 'Right' },
                                ]}
                            />
                        </Field>
                        <Range label="Size" value={f.size} min={4} max={14} step={0.5} unit=" pt" onChange={(size) => setF({ size })} />
                        <Field label="Colour">
                            <input
                                type="color"
                                value={f.color}
                                onChange={(e) => setF({ color: e.target.value })}
                                className={`${inputCls} cursor-pointer p-1`}
                            />
                        </Field>
                    </div>
                </div>
            </Panel>
        </div>
    );
}
