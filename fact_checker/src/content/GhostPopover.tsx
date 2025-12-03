
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { InvestigationView } from './components/InvestigationView';
import { VerdictView } from './components/VerdictView';
import { SourceUpdate, Message } from '../types/messages';

export const GhostPopover: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [stage, setStage] = useState<'idle' | 'investigating' | 'synthesis' | 'error'>('idle');
    const [sources, setSources] = useState<SourceUpdate[]>([]);
    const [verdictStream, setVerdictStream] = useState('');
    const [isStreamComplete, setIsStreamComplete] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const portRef = useRef<chrome.runtime.Port | null>(null);

    // Cleanup port when popover is closed
    useEffect(() => {
        if (!isVisible && portRef.current) {
            console.log('Popover closed, disconnecting port');
            portRef.current.disconnect();
            portRef.current = null;
        }
    }, [isVisible]);

    useEffect(() => {
        const handleMessage = (message: Message) => {
            if (message.type === 'TRIGGER_CHECK_REQUEST') {
                const selection = window.getSelection()?.toString();
                if (selection) {
                    // Cleanup existing connection if any
                    if (portRef.current) {
                        portRef.current.disconnect();
                    }

                    setIsVisible(true);
                    setStage('investigating');
                    setSources([]);
                    setVerdictStream('');
                    setIsStreamComplete(false);
                    setErrorMessage('');

                    // Establish long-lived connection
                    const port = chrome.runtime.connect({ name: 'ghost-stream' });
                    portRef.current = port;

                    // Send the text to start processing
                    port.postMessage({ type: 'START_CHECK', text: selection });

                    // Listen for updates
                    port.onMessage.addListener((msg: Message) => {
                        if (msg.type === 'SOURCE_UPDATE') {
                            setSources((prev) => {
                                const exists = prev.find((s) => s.url === msg.payload.url);
                                if (exists) {
                                    return prev.map((s) => (s.url === msg.payload.url ? msg.payload : s));
                                }
                                return [...prev, msg.payload];
                            });
                        } else if (msg.type === 'STREAM_START') {
                            setStage('synthesis');
                        } else if (msg.type === 'STREAM_CHUNK') {
                            setVerdictStream((prev) => prev + msg.chunk);
                        } else if (msg.type === 'STREAM_END') {
                            setIsStreamComplete(true);
                        } else if (msg.type === 'ERROR') {
                            setStage('error');
                            setErrorMessage(msg.error);
                        }
                    });

                    // Handle unexpected disconnection
                    port.onDisconnect.addListener(() => {
                        console.log('Port disconnected unexpectedly');
                        if (chrome.runtime.lastError) {
                            console.error('Connection error:', chrome.runtime.lastError);
                        }
                        // Only show error if we haven't finished successfully and aren't already in error state
                        if (!isStreamComplete && stage !== 'error') {
                            setStage('error');
                            setErrorMessage('Connection to background service lost.');
                        }
                    });
                }
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
            // Cleanup on unmount (though this component rarely unmounts)
            if (portRef.current) {
                portRef.current.disconnect();
            }
        };
    }, []);




    if (!isVisible) return null;

    return (
        <div className="fixed top-6 right-6 z-[9999] font-sans antialiased text-slate-50">
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-[420px] bg-slate-950/90 backdrop-blur-2xl border border-slate-800/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-white/10"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/30">
                        <h1 className="text-sm font-semibold text-slate-200 flex items-center gap-2.5">
                            {stage === 'investigating' && (
                                <>
                                    <div className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                    </div>
                                    <span className="tracking-wide">Investigating Truth...</span>
                                </>
                            )}
                            {stage === 'synthesis' && (
                                <>
                                    <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="tracking-wide text-emerald-100">Verdict Ready</span>
                                </>
                            )}
                            {stage === 'idle' && (
                                <>
                                    <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="tracking-wide">Ghost Fact-Checker</span>
                                </>
                            )}
                            {stage === 'error' && (
                                <>
                                    <div className="p-1 rounded-lg bg-red-500/10 text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <span className="tracking-wide text-red-100">Error Occurred</span>
                                </>
                            )}
                        </h1>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
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
                            {stage === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-8 flex flex-col items-center justify-center text-center space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                                        <AlertCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-200">Something went wrong</h3>
                                    <p className="text-sm text-slate-400 max-w-[280px]">
                                        {errorMessage || "An unexpected error occurred while processing your request."}
                                    </p>
                                    <button
                                        onClick={() => setIsVisible(false)}
                                        className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

