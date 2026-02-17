"use client";

import React from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-invert max-w-none prose-p:text-fordrax-titanium prose-headings:text-white prose-strong:text-fordrax-cyan prose-a:text-fordrax-blue hover:prose-a:underline prose-ul:list-disc prose-ol:list-decimal", className)}>
            <Markdown
                rehypePlugins={[rehypeRaw]}
                components={{
                    a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
                    img: ({ node, ...props }) => <img className="rounded-lg border border-white/10" {...props} />,
                }}
            >
                {content}
            </Markdown>
        </div>
    );
}
