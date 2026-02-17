"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { submitEvaluation } from "@/lib/actions/evaluation";
import { Loader2, CheckCircle, XCircle, AlertTriangle, ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuizChoice {
    id: string;
    label: string;
    // is_correct is NOT here for security
}

interface QuizQuestion {
    id: string;
    prompt: string;
    difficulty: string;
    choices: QuizChoice[];
}

interface QuizRunnerProps {
    moduleId: string;
    moduleSlug: string;
    moduleTitle: string;
    questions: QuizQuestion[];
}

export function QuizRunner({ moduleId, moduleSlug, moduleTitle, questions }: QuizRunnerProps) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // valid choice IDs
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; passed: boolean; evaluationId?: string } | null>(null);

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isCompleted = Object.keys(answers).length === questions.length;

    const handleSelect = (choiceId: string) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: choiceId
        }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await submitEvaluation({ moduleId, answers });
            if (res.success && res.score !== undefined && res.passed !== undefined) {
                setResult({ score: res.score, passed: res.passed, evaluationId: res.evaluationId });
            } else {
                alert("Error submitting exam: " + res.error);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center pt-20">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                        "rounded-3xl p-10 border-2 backdrop-blur-xl shadow-2xl relative overflow-hidden",
                        result.passed ? "border-fordrax-cyan/50 bg-fordrax-cyan/5" : "border-fordrax-danger/50 bg-fordrax-danger/5"
                    )}
                >
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,transparent)]" />

                    <div className="relative z-10 flex flex-col items-center">
                        {result.passed ? (
                            <div className="w-24 h-24 rounded-full bg-fordrax-cyan/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,229,255,0.4)]">
                                <ShieldCheck className="w-12 h-12 text-fordrax-cyan" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-fordrax-danger/20 flex items-center justify-center mb-6">
                                <XCircle className="w-12 h-12 text-fordrax-danger" />
                            </div>
                        )}

                        <h2 className="text-4xl font-bold mb-2 text-white">
                            {result.passed ? "Certification Granted" : "Assessment Failed"}
                        </h2>
                        <p className="text-xl mb-8 text-white/80">
                            You scored <span className={cn("font-bold", result.passed ? "text-fordrax-cyan" : "text-fordrax-danger")}>{result.score.toFixed(0)}%</span>
                        </p>

                        {result.passed ? (
                            <div className="space-y-4 w-full max-w-sm">
                                <Link
                                    href={`/certificate/${result.evaluationId}`}
                                    className="block w-full py-4 rounded-xl bg-fordrax-cyan text-black font-bold hover:bg-white transition-colors"
                                >
                                    Download Certificate
                                </Link>
                                <Link
                                    href="/library"
                                    className="block w-full py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                                >
                                    Return to Library
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4 w-full max-w-sm">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full py-4 rounded-xl bg-fordrax-danger text-white font-bold hover:bg-red-600 transition-colors"
                                >
                                    Retry Assessment
                                </button>
                                <Link
                                    href={`/studio/${moduleSlug}`}
                                    className="block w-full py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                                >
                                    Review Material
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
            {/* Header / Progress */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Final Assessment</h1>
                    <p className="text-fordrax-titanium text-sm">{moduleTitle}</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-mono font-bold text-fordrax-cyan">
                        {currentIndex + 1}<span className="text-lg text-white/30">/{questions.length}</span>
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/10 rounded-full mb-12 overflow-hidden">
                <div className="h-full bg-fordrax-cyan transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion?.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                >
                    <h2 className="text-2xl md:text-3xl font-medium text-white mb-10 leading-relaxed">
                        {currentQuestion?.prompt}
                    </h2>

                    <div className="grid gap-4">
                        {currentQuestion?.choices.map((choice) => {
                            const isSelected = answers[currentQuestion.id] === choice.id;
                            return (
                                <button
                                    key={choice.id}
                                    onClick={() => handleSelect(choice.id)}
                                    className={cn(
                                        "w-full text-left p-6 rounded-xl border transition-all flex items-center justify-between group",
                                        isSelected
                                            ? "bg-fordrax-blue/20 border-fordrax-blue text-white shadow-[0_0_30px_rgba(0,87,255,0.2)]"
                                            : "bg-fordrax-panel border-white/5 text-fordrax-titanium hover:border-white/20 hover:text-white"
                                    )}
                                >
                                    <span className="text-lg">{choice.label}</span>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        isSelected ? "border-fordrax-blue bg-fordrax-blue" : "border-white/20 group-hover:border-white/50"
                                    )}>
                                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Footer Navigation */}
            <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
                <button
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-6 py-3 rounded-lg text-fordrax-titanium hover:text-white disabled:opacity-0 transition-colors flex items-center gap-2"
                >
                    <ChevronLeft className="w-5 h-5" /> Previous
                </button>

                {currentIndex === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!isCompleted || isSubmitting}
                        className="px-8 py-3 rounded-lg bg-fordrax-cyan text-black font-bold hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Calculating...</>
                        ) : (
                            <>Submit Assessment <ShieldCheck className="w-5 h-5" /></>
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        className="px-8 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 font-medium transition-colors flex items-center gap-2"
                    >
                        Next Question <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
