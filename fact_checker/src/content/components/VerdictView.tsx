import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
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
                <div className="prose prose-sm prose-slate max-w-none">
                    <p className="leading-relaxed text-slate-700">
                        {stream}
                        {!isComplete && (
                            <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle"></span>
                        )}
                    </p>
                </div>
            </div>

            {/* Evidence Footer */}
            <div className="mt-auto border-t border-slate-100 bg-slate-50/50">
                <button
                    onClick={() => setShowSources(!showSources)}
                    className="w-full px-6 py-3 flex items-center justify-between hover:bg-slate-100/50 transition-colors text-left group cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Evidence ({sources.length})
                        </span>
                        <div className="flex -space-x-2">
                            {sources.slice(0, 5).map((source, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 ring-2 ring-white"
                                    title={source.domain}
                                >
                                    {source.domain[0].toUpperCase()}
                                </div>
                            ))}
                            {sources.length > 5 && (
                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 ring-2 ring-white">
                                    +{sources.length - 5}
                                </div>
                            )}
                        </div>
                    </div>
                    <ChevronDown
                        className={`w-4 h-4 text-slate-400 transform transition-transform ${showSources ? 'rotate-180' : ''}`}
                    />
                </button>

                <AnimatePresence>
                    {showSources && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-slate-100 bg-white"
                        >
                            <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                                {sources.map((source) => (
                                    <div key={source.url} className="group/item">
                                        <div
                                            onClick={() => setExpandedSource(expandedSource === source.url ? null : source.url)}
                                            className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <div className={`w-2 h-2 rounded-full transition-colors ${expandedSource === source.url ? 'bg-blue-400' : 'bg-slate-300'}`}></div>
                                                <span className="text-slate-700 truncate">{source.domain}</span>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${source.status === 'supports' ? 'bg-emerald-100 text-emerald-700' :
                                                source.status === 'debunks' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-slate-100 text-slate-600'
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
                                                    <div className="px-6 pb-3 pt-1 text-xs text-slate-600 leading-relaxed border-l-2 border-slate-100 ml-3 space-y-2">
                                                        <p>{source.verdict}</p>
                                                        {source.quote && (
                                                            <a
                                                                href={`${source.url}#:~:text=${encodeURIComponent(source.quote)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="block hover:bg-slate-50 transition-colors rounded group/quote"
                                                                title="View source context"
                                                            >
                                                                <blockquote className="italic text-slate-500 border-l-2 border-slate-300 pl-2 my-1 hover:border-blue-400 hover:text-slate-700 transition-colors">
                                                                    "{source.quote}"
                                                                    <span className="inline-block ml-1 opacity-0 group-hover/quote:opacity-100 transition-all duration-200 transform translate-y-1 group-hover/quote:translate-y-0">
                                                                        <ExternalLink className="w-3 h-3 text-blue-400" />
                                                                    </span>
                                                                </blockquote>
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
