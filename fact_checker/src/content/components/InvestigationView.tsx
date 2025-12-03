import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { SourceUpdate } from '../../types/messages';

interface InvestigationViewProps {
    sources: SourceUpdate[];
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({ sources }) => {
    return (
        <div className="p-4 space-y-3">
            {sources.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                    Searching for relevant sources...
                </div>
            )}

            {sources.map((source, index) => (
                <motion.div
                    key={source.url}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                    {/* Favicon Placeholder */}
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                        {source.domain[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 truncate">
                            {source.domain}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                            {source.status === 'analyzing' ? 'Reading content...' : source.verdict || 'Processed'}
                        </div>
                    </div>

                    <div className="shrink-0">
                        {source.status === 'analyzing' && (
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        )}
                        {source.status === 'supports' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                <CheckCircle className="w-3 h-3" />
                                Supports
                            </span>
                        )}
                        {source.status === 'debunks' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                <XCircle className="w-3 h-3" />
                                Debunks
                            </span>
                        )}
                        {source.status === 'neutral' && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
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
