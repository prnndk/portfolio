'use client';

import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppearance } from '@/hooks/use-appearance';
import { Check, Copy } from 'lucide-react';

interface MDXContentProps {
    content: string;
    className?: string;
}

// Code block component with syntax highlighting and copy button
function CodeBlock({ language, value }: { language: string; value: string }) {
    const { appearance } = useAppearance();
    const [copied, setCopied] = React.useState(false);
    const isDark = appearance === 'dark' || (appearance === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative my-6 overflow-hidden rounded-lg border border-border bg-muted/50">
            {/* Header with language label and copy button */}
            <div className="flex items-center justify-between border-b border-border bg-muted/80 px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {language || 'code'}
                </span>
                <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    title="Copy code"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            {/* Code content */}
            <SyntaxHighlighter
                language={language}
                style={isDark ? oneDark : oneLight}
                customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.7',
                }}
                showLineNumbers={value.split('\n').length > 3}
                lineNumberStyle={{
                    minWidth: '2.5rem',
                    paddingRight: '1rem',
                    color: isDark ? '#636d83' : '#9ca3af',
                    userSelect: 'none',
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    );
}

// Inline code component
function InlineCode({ children }: { children?: React.ReactNode }) {
    return (
        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
            {children}
        </code>
    );
}

export function MDXContent({ content, className = '' }: MDXContentProps) {
    const components: Components = {
        // Code blocks
        code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const value = String(children).replace(/\n$/, '');
            const isMultiLine = value.includes('\n');

            if (match || isMultiLine) {
                return <CodeBlock language={match?.[1] || ''} value={value} />;
            }

            return <InlineCode>{children}</InlineCode>;
        },
        // Pre - just pass through children since code handles it
        pre({ children }) {
            return <>{children}</>;
        },
        // Headings with anchor links
        h1({ children, ...props }) {
            const text = typeof children === 'string' ? children : '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
                <h1 id={id} className="group scroll-mt-24 mt-8 mb-4 text-3xl font-bold" {...props}>
                    {children}
                    <a href={`#${id}`} className="ml-2 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-primary">#</a>
                </h1>
            );
        },
        h2({ children, ...props }) {
            const text = typeof children === 'string' ? children : '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
                <h2 id={id} className="group scroll-mt-24 mt-8 mb-4 text-2xl font-bold" {...props}>
                    {children}
                    <a href={`#${id}`} className="ml-2 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-primary">#</a>
                </h2>
            );
        },
        h3({ children, ...props }) {
            const text = typeof children === 'string' ? children : '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
                <h3 id={id} className="group scroll-mt-24 mt-6 mb-3 text-xl font-bold" {...props}>
                    {children}
                    <a href={`#${id}`} className="ml-2 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-primary">#</a>
                </h3>
            );
        },
        h4({ children, ...props }) {
            const text = typeof children === 'string' ? children : '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
                <h4 id={id} className="group scroll-mt-24 mt-6 mb-2 text-lg font-bold" {...props}>
                    {children}
                    <a href={`#${id}`} className="ml-2 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-primary">#</a>
                </h4>
            );
        },
        // Blockquote
        blockquote({ children, ...props }) {
            return (
                <blockquote className="my-6 border-l-4 border-primary/50 bg-muted/30 pl-6 py-4 italic text-muted-foreground" {...props}>
                    {children}
                </blockquote>
            );
        },
        // Tables
        table({ children, ...props }) {
            return (
                <div className="my-6 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm" {...props}>{children}</table>
                </div>
            );
        },
        thead({ children, ...props }) {
            return <thead className="bg-muted/50" {...props}>{children}</thead>;
        },
        tr({ children, ...props }) {
            return <tr className="border-b border-border last:border-0" {...props}>{children}</tr>;
        },
        th({ children, ...props }) {
            return <th className="px-4 py-3 text-left font-semibold" {...props}>{children}</th>;
        },
        td({ children, ...props }) {
            return <td className="px-4 py-3 text-left" {...props}>{children}</td>;
        },
        // Images with caption
        img({ src, alt, ...props }) {
            return (
                <figure className="my-8">
                    <div className="overflow-hidden rounded-lg border border-border">
                        <img
                            src={src}
                            alt={alt || ''}
                            className="w-full object-cover"
                            loading="lazy"
                            {...props}
                        />
                    </div>
                    {alt && (
                        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                            {alt}
                        </figcaption>
                    )}
                </figure>
            );
        },
        // Links
        a({ href, children, ...props }) {
            const isExternal = href?.startsWith('http');
            return (
                <a
                    href={href}
                    className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
                    {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
                    {...props}
                >
                    {children}
                </a>
            );
        },
        // Lists
        ul({ children, ...props }) {
            return <ul className="my-4 list-disc space-y-2 pl-6" {...props}>{children}</ul>;
        },
        ol({ children, ...props }) {
            return <ol className="my-4 list-decimal space-y-2 pl-6" {...props}>{children}</ol>;
        },
        li({ children, ...props }) {
            return <li className="leading-relaxed" {...props}>{children}</li>;
        },
        // Horizontal rule
        hr(props) {
            return <hr className="my-8 border-t border-border" {...props} />;
        },
        // Paragraphs
        p({ children, ...props }) {
            return <p className="my-4 leading-relaxed" {...props}>{children}</p>;
        },
        // Strong/Bold
        strong({ children, ...props }) {
            return <strong className="font-semibold text-foreground" {...props}>{children}</strong>;
        },
        // Emphasis/Italic
        em({ children, ...props }) {
            return <em className="italic" {...props}>{children}</em>;
        },
    };

    return (
        <div className={`prose prose-lg dark:prose-invert max-w-none 
            prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight
            prose-p:leading-relaxed prose-p:text-foreground/90
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:no-underline
            ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
