import React from 'react';
import { Settings, Shield, ExternalLink, Zap, Lock } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { motion } from 'framer-motion';

const Popup: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();

    if (loading) {
        return (
            <div className="w-80 h-96 flex items-center justify-center bg-slate-950 text-slate-400">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Shield size={24} className="opacity-50" />
                </motion.div>
            </div>
        );
    }

    const toggleEnabled = () => {
        updateSettings({ enabled: !settings.enabled });
    };

    const openSettings = () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('src/options/index.html'));
        }
    };

    const isLocal = settings.llmProvider === 'local';

    return (
        <div className="w-80 min-h-[400px] bg-slate-950 relative overflow-hidden font-sans text-slate-50 selection:bg-indigo-500/30">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-6 flex flex-col h-full">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                            Ghost
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase opacity-80">
                            Ethereal Truth
                        </p>
                    </div>

                    {/* Privacy Shield Indicator */}
                    <div className="relative group">
                        <div className={`absolute inset-0 blur-md transition-opacity duration-500 ${settings.enabled ? 'opacity-40' : 'opacity-0'} ${isLocal ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                        <div className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md transition-all duration-300 ${settings.enabled
                            ? (isLocal ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400')
                            : 'bg-slate-800/50 border-slate-700 text-slate-500'
                            }`}>
                            {isLocal ? <Lock size={12} /> : <Zap size={12} />}
                            <span className="text-[10px] font-semibold tracking-wide">
                                {settings.enabled ? (isLocal ? 'PRIVATE' : 'CLOUD') : 'OFF'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Controls */}
                <div className="flex-1 space-y-4">
                    {/* Power Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={toggleEnabled}
                        className={`group relative w-full p-1 rounded-2xl border transition-all duration-300 overflow-hidden ${settings.enabled
                            ? 'border-slate-700 bg-slate-900/40'
                            : 'border-slate-800 bg-slate-900/40'
                            }`}
                    >
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${settings.enabled ? 'from-red-500/10 to-orange-500/10' : 'from-emerald-500/10 to-cyan-500/10'}`} />

                        <div className={`relative flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${settings.enabled
                            ? 'bg-slate-800/50 group-hover:bg-slate-800/30'
                            : 'bg-slate-800/30 group-hover:bg-slate-800/50'
                            }`}>
                            <div className="flex flex-col items-start">
                                <span className={`text-sm font-semibold transition-colors ${settings.enabled ? 'text-slate-200' : 'text-slate-400'}`}>
                                    Fact-Checking
                                </span>
                                <span className={`text-xs transition-colors ${settings.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {settings.enabled ? 'Active & Monitoring' : 'Paused'}
                                </span>
                            </div>

                            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${settings.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                <motion.div
                                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                                    animate={{ x: settings.enabled ? 16 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </div>
                        </div>
                    </motion.button>

                    {/* Settings Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openSettings}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-200 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/20 transition-colors">
                                <Settings size={18} />
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200">
                                Configuration
                            </span>
                        </div>
                        <ExternalLink size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </motion.button>
                </div>

                {/* Footer */}
                <footer className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${settings.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                        <span>v1.0.0</span>
                    </div>
                    <a
                        href="https://github.com/quocduyvu6262/CSCE670-Project"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-indigo-400 transition-colors flex items-center gap-1"
                    >
                        <span>GitHub</span>
                        <ExternalLink size={10} />
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default Popup;
