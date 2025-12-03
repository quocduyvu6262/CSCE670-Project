import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { InvestigationView } from './components/InvestigationView';
import { VerdictView } from './components/VerdictView';
import { SourceUpdate, Message } from '../types/messages';

export const GhostPopover: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [stage, setStage] = useState<'idle' | 'investigating' | 'synthesis'>('idle');
    const [sources, setSources] = useState<SourceUpdate[]>([]);
    const [verdictStream, setVerdictStream] = useState('');
    const [isStreamComplete, setIsStreamComplete] = useState(false);

    useEffect(() => {
        const handleMessage = (message: Message) => {
            if (message.type === 'TRIGGER_CHECK') {
                setIsVisible(true);
                setStage('investigating');
                setSources([]);
                setVerdictStream('');
                setIsStreamComplete(false);
            } else if (message.type === 'SOURCE_UPDATE') {
                setSources((prev) => {
                    const exists = prev.find((s) => s.url === message.payload.url);
                    if (exists) {
                        return prev.map((s) => (s.url === message.payload.url ? message.payload : s));
                    }
                    return [...prev, message.payload];
                });
            } else if (message.type === 'STREAM_START') {
                setStage('synthesis');
            } else if (message.type === 'STREAM_CHUNK') {
                setVerdictStream((prev) => prev + message.chunk);
            } else if (message.type === 'STREAM_END') {
                setIsStreamComplete(true);
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 font-sans antialiased">
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="w-[420px] bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
                        <h1 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            {stage === 'investigating' && (
                                <>
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                                    </span>
                                    Investigating...
                                </>
                            )}
                            {stage === 'synthesis' && (
                                <>
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    <span>Verdict Ready</span>
                                </>
                            )}
                        </h1>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-0">
                        <AnimatePresence mode="wait">
                            {stage === 'investigating' && (
                                <InvestigationView key="investigation" sources={sources} />
                            )}
                            {stage === 'synthesis' && (
                                <VerdictView
                                    key="verdict"
                                    stream={verdictStream}
                                    sources={sources}
                                    isComplete={isStreamComplete}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
