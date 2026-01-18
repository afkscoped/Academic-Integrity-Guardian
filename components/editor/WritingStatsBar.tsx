import React, { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle, MessageSquare, Zap } from 'lucide-react';

interface WritingStatsBarProps {
    content: string;
}

export const WritingStatsBar: React.FC<WritingStatsBarProps> = ({ content }) => {
    const [stats, setStats] = useState({
        readingTime: 0,
        passiveVoiceCount: 0,
        longSentenceCount: 0,
        wordCount: 0
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const words = content.trim() ? content.trim().split(/\s+/).length : 0;
            const readingTime = Math.ceil(words / 200);

            // Passive Voice Detection
            const passiveVoiceMatches = content.match(/\b(am|are|is|was|were|been|being)\b\s+\w+ed\b/ig) || [];

            // Sentence Length Check (> 25 words)
            const sentences = content.split(/[.?!]/).filter(s => s.trim().length > 0);
            const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 25);

            setStats({
                wordCount: words,
                readingTime,
                passiveVoiceCount: passiveVoiceMatches.length,
                longSentenceCount: longSentences.length
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [content]);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t animate-fade-in-up" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-[11px] font-medium tracking-tight overflow-x-auto gap-8">
                <div className="flex items-center gap-6 whitespace-nowrap">
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <Clock size={14} className="text-accent-primary" />
                        <span>{stats.readingTime} MIN READ</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <MessageSquare size={14} className="text-accent-primary" />
                        <span>{stats.wordCount} WORDS</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 whitespace-nowrap">
                    <div className={`flex items-center gap-2 transition-colors ${stats.passiveVoiceCount > 5 ? 'text-error' : 'text-text-secondary'}`}
                        title="Excessive passive voice can weaken academic writing">
                        <Zap size={14} className={stats.passiveVoiceCount > 5 ? 'text-error animate-pulse' : 'text-warning'} />
                        <span className="uppercase">Passive Voice: {stats.passiveVoiceCount}</span>
                    </div>

                    <div className={`flex items-center gap-2 transition-colors ${stats.longSentenceCount > 2 ? 'text-error' : 'text-text-secondary'}`}
                        title="Sentences over 25 words may be harder to follow">
                        <AlertTriangle size={14} className={stats.longSentenceCount > 2 ? 'text-error animate-pulse' : 'text-warning'} />
                        <span className="uppercase">Complex Sentences: {stats.longSentenceCount}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">AI Health Monitor Active</span>
                </div>
            </div>
        </div>
    );
};
