import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, Quote } from 'lucide-react';
import { SourceUpdate } from '../../types/messages';

interface VerdictViewProps {
    stream: string;
    sources: SourceUpdate[];
    isComplete: boolean;
}

export const VerdictView: React.FC<VerdictViewProps> = ({ stream, sources, isComplete }) => {
    const [showSources, setShowSources] = useState(false);
    const [expandedSource, setExpandedSource] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 space-y-4">
                <div className="prose prose-invert prose-sm max-w-none">
                    <p className="leading-relaxed text-slate-200 font-serif text-base tracking-wide">
                        {stream}
                        {!isComplete && (
                            <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-400 animate-pulse align-middle rounded-full"></span>
                        )}
                    </p>
                </div>
            </div>

            {/* Evidence Footer */}
            <div className="mt-auto border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
                <button
                    onClick={() => setShowSources(!showSources)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors text-left group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Evidence ({sources.length})
                        </span>
                        <div className="flex -space-x-2">
                            {sources.slice(0, 5).map((source, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 ring-2 ring-slate-900"
                                    title={source.domain}
                                >
                                    {source.domain[0].toUpperCase()}
                                </div>
                            ))}
                            {sources.length > 5 && (
                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 ring-2 ring-slate-900">
                                    +{sources.length - 5}
                                </div>
                            )}
                        </div>
                    </div>
                    <ChevronDown
                        className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transform transition-transform duration-300 ${showSources ? 'rotate-180' : ''}`}
                    />
                </button>

                <AnimatePresence>
                    {showSources && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-slate-800/50 bg-slate-900/50"
                        >
                            <div className="p-4 space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                {sources.map((source) => (
                                    <div key={source.url} className="group/item">
                                        <div
                                            onClick={() => setExpandedSource(expandedSource === source.url ? null : source.url)}
                                            className="flex items-center justify-between text-sm p-3 hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-700/50"
                                        >
                                            <div className="flex items-center gap-3 truncate">
                                                <div className={`w-2 h-2 rounded-full transition-colors ${expandedSource === source.url ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]' : 'bg-slate-600'}`}></div>
                                                <span className="text-slate-300 font-medium truncate">{source.domain}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${source.status === 'supports' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                source.status === 'debunks' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                                    'bg-slate-800 text-slate-500 border border-slate-700'
                                                }`}>
                                                {source.status}
                                            </span>
                                        </div>
                                        <AnimatePresence>
                                            {expandedSource === source.url && source.verdict && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 pt-2 ml-4 border-l border-slate-800 space-y-3">
                                                        <p className="text-xs text-slate-400 leading-relaxed">{source.verdict}</p>
                                                        {source.quote && (
                                                            <a
                                                                href={`${source.url}#:~:text=${encodeURIComponent(source.quote)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block group/quote"
                                                                title="View source context"
                                                            >
                                                                <div className="relative p-3 rounded-lg bg-slate-800/30 border border-slate-800 hover:border-indigo-500/30 transition-colors">
                                                                    <Quote className="absolute top-2 left-2 w-3 h-3 text-slate-600" />
                                                                    <blockquote className="text-xs italic text-slate-500 pl-4 group-hover/quote:text-slate-300 transition-colors">
                                                                        "{source.quote}"
                                                                    </blockquote>
                                                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover/quote:opacity-100 transition-opacity">
                                                                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
