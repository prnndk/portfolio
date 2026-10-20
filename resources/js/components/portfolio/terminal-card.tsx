'use client';

import { cn } from '@/lib/utils';

interface TerminalCardProps {
    className?: string;
    filename?: string;
}

export function TerminalCard({ className, filename = 'arya.config.ts' }: TerminalCardProps) {
    return (
        <div
            className={cn(
                'relative w-full max-w-[500px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40',
                className,
            )}
        >
            <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-5 py-3">
                <span className="size-3 rounded-full bg-[#ff5f57]" />
                <span className="size-3 rounded-full bg-[#febc2e]" />
                <span className="size-3 rounded-full bg-[#28c840]" />
                <span className="mr-auto ml-auto font-mono text-xs tracking-[0.05em] text-muted-foreground">{filename}</span>
            </div>

            <div className="p-6 font-mono text-[0.82rem] leading-[1.9]">
                <Line>
                    <Comment>// Developer profile</Comment>
                </Line>
                <Blank />
                <Line>
                    <Key>const</Key>
                    <Plain> developer </Plain>
                    <Obj>= {'{'}</Obj>
                </Line>
                <Indent>
                    <Key>name</Key>
                    <Obj>: </Obj>
                    <Val>"Arya Gading Prinandika"</Val>
                    <Obj>,</Obj>
                </Indent>
                <Indent>
                    <Key>role</Key>
                    <Obj>: </Obj>
                    <Val>"Full-Stack Developer"</Val>
                    <Obj>,</Obj>
                </Indent>
                <Indent>
                    <Key>location</Key>
                    <Obj>: </Obj>
                    <Val>"Indonesia 🇮🇩"</Val>
                    <Obj>,</Obj>
                </Indent>
                <Blank />
                <Indent>
                    <Key>stack</Key>
                    <Obj>: [</Obj>
                </Indent>
                <Line className="pl-12">
                    <Val>"React"</Val>
                    <Obj>, </Obj>
                    <Val>"Next.js"</Val>
                    <Obj>, </Obj>
                    <Val>"Node.js"</Val>
                    <Obj>,</Obj>
                </Line>
                <Line className="pl-12">
                    <Val>"Python"</Val>
                    <Obj>, </Obj>
                    <Val>"AWS"</Val>
                    <Obj>, </Obj>
                    <Val>"Docker"</Val>
                </Line>
                <Indent>
                    <Obj>],</Obj>
                </Indent>
                <Blank />
                <Indent>
                    <Key>available</Key>
                    <Obj>: </Obj>
                    <span className="text-emerald-500 dark:text-emerald-400">true</span>
                </Indent>
                <Line>
                    <Obj>{'}'}</Obj>
                </Line>
                <Blank />
                <Line>
                    <Key>export default</Key>
                    <Plain> developer</Plain>
                    <Obj>;</Obj>
                </Line>
                <Blank />
                <Line>
                    <span className="text-primary select-none">▸</span>
                    <Plain> Ready to build something great</Plain>
                    <span className="ml-1 inline-block h-[1.1em] w-[2px] translate-y-[3px] [animation:var(--animate-blink)] bg-primary" />
                </Line>
            </div>
        </div>
    );
}

function Line({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('flex flex-wrap gap-x-2', className)}>{children}</div>;
}

function Indent({ children }: { children: React.ReactNode }) {
    return <Line className="pl-6">{children}</Line>;
}

function Blank() {
    return <div className="h-2" />;
}

function Key({ children }: { children: React.ReactNode }) {
    return <span className="text-[color:var(--accent2)]">{children}</span>;
}

function Val({ children }: { children: React.ReactNode }) {
    return <span className="text-emerald-500 dark:text-emerald-400">{children}</span>;
}

function Obj({ children }: { children: React.ReactNode }) {
    return <span className="text-muted-foreground">{children}</span>;
}

function Plain({ children }: { children: React.ReactNode }) {
    return <span className="text-foreground">{children}</span>;
}

function Comment({ children }: { children: React.ReactNode }) {
    return <span className="text-muted-foreground italic">{children}</span>;
}
