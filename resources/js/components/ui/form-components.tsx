'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
    label: string;
    htmlFor?: string;
    required?: boolean;
    error?: string;
    description?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function FormField({ label, htmlFor, required, error, description, children, className }: FormFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor={htmlFor} className="text-sm font-medium">
                {label}
                {required && <span className="ml-1 text-destructive">*</span>}
            </Label>
            {children}
            {description && !error && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}

interface FormSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <div className="border-b border-border pb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}

interface FormRowProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'sm:grid-cols-2',
        3: 'sm:grid-cols-3',
        4: 'sm:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div className={cn('grid gap-4', gridCols[columns], className)}>
            {children}
        </div>
    );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    required?: boolean;
    error?: string;
    description?: string;
}

export function TextareaField({ label, required, error, description, className, ...props }: TextareaFieldProps) {
    return (
        <FormField label={label} htmlFor={props.id} required={required} error={error} description={description}>
            <textarea
                className={cn(
                    'flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
                    'ring-offset-background placeholder:text-muted-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'transition-colors duration-200',
                    className
                )}
                {...props}
            />
        </FormField>
    );
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    required?: boolean;
    error?: string;
    description?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export function SelectField({ label, required, error, description, options, placeholder, className, ...props }: SelectFieldProps) {
    return (
        <FormField label={label} htmlFor={props.id} required={required} error={error} description={description}>
            <select
                className={cn(
                    'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
                    'ring-offset-background',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'transition-colors duration-200',
                    className
                )}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FormField>
    );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    required?: boolean;
    error?: string;
    description?: React.ReactNode;
}

export function InputField({ label, required, error, description, className, ...props }: InputFieldProps) {
    return (
        <FormField label={label} htmlFor={props.id} required={required} error={error} description={description}>
            <Input
                className={cn('transition-colors duration-200', className)}
                {...props}
            />
        </FormField>
    );
}

interface SwitchFieldProps {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
}

export function SwitchField({ id, label, description, checked, onCheckedChange, className }: SwitchFieldProps) {
    return (
        <div className={cn('flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50', className)}>
            <div className="relative">
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => onCheckedChange(!checked)}
                    className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        checked ? 'bg-primary' : 'bg-input'
                    )}
                >
                    <span
                        className={cn(
                            'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
                            checked ? 'translate-x-5' : 'translate-x-0'
                        )}
                    />
                </button>
            </div>
            <div className="flex-1">
                <label htmlFor={id} className="cursor-pointer text-sm font-medium">
                    {label}
                </label>
                {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
            </div>
        </div>
    );
}

interface TagInputProps {
    label: string;
    tags: string[];
    onTagsChange: (tags: string[]) => void;
    placeholder?: string;
    description?: string;
}

export function TagInput({ label, tags, onTagsChange, placeholder = 'Add a tag...', description }: TagInputProps) {
    const [input, setInput] = React.useState('');

    const addTag = () => {
        if (input.trim() && !tags.includes(input.trim())) {
            onTagsChange([...tags, input.trim()]);
            setInput('');
        }
    };

    const removeTag = (tag: string) => {
        onTagsChange(tags.filter((t) => t !== tag));
    };

    return (
        <FormField label={label} description={description}>
            <div className="space-y-3">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholder}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                    >
                        Add
                    </button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
                                >
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </FormField>
    );
}

interface ColorInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    description?: string;
}

export function ColorInput({ id, label, value, onChange, description }: ColorInputProps) {
    return (
        <FormField label={label} htmlFor={id} description={description}>
            <div className="flex gap-2">
                <div className="relative">
                    <input
                        id={id}
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-10 w-14 cursor-pointer rounded-lg border border-input p-1"
                    />
                </div>
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#3B82F6"
                    className="flex-1 font-mono text-sm"
                />
            </div>
        </FormField>
    );
}
