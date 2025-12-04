import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertCircle, Globe } from 'lucide-react';
import { SourceUpdate } from '../../types/messages';

interface InvestigationViewProps {
    sources: SourceUpdate[];
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({ sources }) => {
    return (
        <div className="p-6 space-y-4">
            {sources.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 space-y-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                        <Globe className="relative w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                    <span className="text-sm font-medium">Scanning the ethereal web...</span>
                </div>
            )}

            {sources.map((source, index) => (
                <motion.div
                    key={source.url}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-colors group"
                >
                    {/* Favicon Placeholder */}
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 group-hover:scale-105 transition-transform">
                        {source.domain[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">
                            {source.domain}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                            {source.status === 'analyzing' ? 'Reading content...' : source.verdict || 'Processed'}
                        </div>
                    </div>

                    <div className="shrink-0">
                        {source.status === 'analyzing' && (
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        )}
                        {source.status === 'supports' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" />
                                Supports
                            </span>
                        )}
                        {source.status === 'debunks' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <XCircle className="w-3 h-3" />
                                Debunks
                            </span>
                        )}
                        {source.status === 'neutral' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                <AlertCircle className="w-3 h-3" />
                                Neutral
                            </span>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
