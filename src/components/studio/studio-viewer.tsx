"use client";

import { useState } from "react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";
import { Play, CheckCircle, Lock, MonitorPlay, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Lesson {
    id: string;
    title: string;
    section_key: string;
    content_markdown: string;
}

interface Module {
    id: string;
    title: string;
    slug: string;
    description: string;
    content_markdown: string; // Fallback only
    duration_min: number;
}

interface StudioViewerProps {
    module: Module;
    lessons: Lesson[];
}

export function StudioViewer({ module, lessons }: StudioViewerProps) {
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);

    const activeLesson = lessons[activeLessonIndex];
    // If no lessons, show module fallback content as a single "Intro" lesson
    const content = activeLesson ? activeLesson.content_markdown : module.content_markdown;
    const title = activeLesson ? activeLesson.title : "Introduction";

    const isLastLesson = activeLessonIndex === lessons.length - 1;

    return (
        <div className="flex h-full">
            {/* Left Sidebar: Lesson Navigation */}
            <div className="w-80 bg-fordrax-panel border-r border-white/5 flex flex-col h-full overflow-y-auto">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-sm font-mono text-fordrax-cyan mb-2">MODULE</h2>
                    <h1 className="font-bold text-lg leading-tight">{module.title}</h1>
                    <p className="text-xs text-fordrax-titanium mt-2 flex items-center gap-2">
                        <MonitorPlay className="w-3 h-3" /> {module.duration_min} min estimated
                    </p>
                </div>

                <div className="p-4 space-y-1">
                    {lessons.length > 0 ? (
                        lessons.map((lesson, idx) => {
                            const isActive = idx === activeLessonIndex;
                            const isPast = idx < activeLessonIndex;

                            return (
                                <button
                                    key={lesson.id}
                                    onClick={() => setActiveLessonIndex(idx)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-3",
                                        isActive
                                            ? "bg-fordrax-blue/20 text-white border-l-2 border-fordrax-blue"
                                            : "text-fordrax-titanium hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                                        isActive ? "bg-fordrax-blue text-white" :
                                            isPast ? "bg-fordrax-cyan/20 text-fordrax-cyan" : "bg-white/10 text-white/40"
                                    )}>
                                        {isPast ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                                    </div>
                                    <span className="truncate">{lesson.title}</span>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-4 text-sm text-fordrax-titanium italic">
                            No logic breakdown available. Showing summary.
                        </div>
                    )}
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <Link
                        href={`/library`}
                        className="text-xs text-fordrax-titanium hover:text-white flex items-center gap-2"
                    >
                        ← Back to Library
                    </Link>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full bg-fordrax-black relative">

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-4xl mx-auto w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeLessonIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-6 flex items-center gap-2 text-fordrax-cyan text-xs font-mono uppercase tracking-widest">
                                <span>Part {activeLessonIndex + 1}</span>
                                <span className="text-white/20">/</span>
                                <span>{lessons.length || 1}</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">{title}</h1>

                            <div className="prose-container bg-fordrax-panel/30 border border-white/5 rounded-2xl p-8 md:p-10 shadow-lg shadow-black/50">
                                <MarkdownRenderer content={content} />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Bottom Navigation */}
                    <div className="mt-12 flex justify-between items-center pb-20">
                        <button
                            onClick={() => setActiveLessonIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeLessonIndex === 0}
                            className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>

                        {isLastLesson && lessons.length > 0 ? (
                            <Link
                                href={`/evaluation/${module.slug}`}
                                className="group px-6 py-3 rounded-lg bg-gradient-to-r from-fordrax-blue to-fordrax-cyan text-white font-bold shadow-[0_0_20px_rgba(0,195,255,0.3)] hover:shadow-[0_0_30px_rgba(0,195,255,0.5)] transition-all flex items-center gap-2"
                            >
                                <GraduationCap className="w-5 h-5" />
                                Start Evaluation
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <button
                                onClick={() => setActiveLessonIndex(prev => Math.min(lessons.length - 1, prev + 1))}
                                disabled={isLastLesson || lessons.length === 0}
                                className="px-6 py-3 rounded-lg bg-white text-black hover:bg-white/90 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                Next Lesson
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
