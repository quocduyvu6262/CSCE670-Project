import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Shield, Cpu, Key, Eye, Lock, Zap, Check } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { motion, AnimatePresence } from 'framer-motion';

const Options: React.FC = () => {
    const { settings, updateSettings, loading } = useSettings();
    const [localSettings, setLocalSettings] = useState(settings);
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        if (!loading) {
            setLocalSettings(settings);
        }
    }, [loading, settings]);

    const handleChange = (key: keyof typeof settings, value: any) => {
        setLocalSettings((prev) => {
            const next = { ...prev, [key]: value };
            setIsDirty(JSON.stringify(next) !== JSON.stringify(settings));
            return next;
        });
        setSaveStatus('idle');
    };

    const handleSave = () => {
        setSaveStatus('saving');
        updateSettings(localSettings);
        setTimeout(() => {
            setSaveStatus('saved');
            setIsDirty(false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

    const handleReset = () => {
        setLocalSettings(settings);
        setIsDirty(false);
        setSaveStatus('idle');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Shield size={32} className="opacity-50" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-[10%] right-[20%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-12"
                >
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent tracking-tight mb-2">
                            Ghost Settings
                        </h1>
                        <p className="text-slate-400 text-lg font-light">Configure your ethereal fact-checking experience.</p>
                    </div>
                    <div className="w-16 h-16 bg-slate-900/50 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-slate-800 shadow-xl ring-1 ring-white/5">
                        <Shield className="text-indigo-400" size={32} />
                    </div>
                </motion.div>

                <div className="space-y-8">
                    {/* Appearance Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 shadow-xl"
                    >
                        <h2 className="text-2xl font-semibold text-slate-200 mb-6 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                                <Eye size={24} />
                            </div>
                            Appearance
                        </h2>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                            <div>
                                <label htmlFor="showCheckPill" className="block text-base font-medium text-slate-200">
                                    Show Check Pill
                                </label>
                                <p className="text-sm text-slate-400 mt-1">
                                    Display the floating "Check" pill when text is selected.
                                </p>
                            </div>
                            <button
                                id="showCheckPill"
                                onClick={() => handleChange('showCheckPill', !localSettings.showCheckPill)}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${localSettings.showCheckPill ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'bg-slate-700'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${localSettings.showCheckPill ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </motion.section>

                    {/* AI Configuration Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/50 p-8 shadow-xl"
                    >
                        <h2 className="text-2xl font-semibold text-slate-200 mb-8 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                <Cpu size={24} />
                            </div>
                            AI Configuration
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
                                    Intelligence Source
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleChange('llmProvider', 'google')}
                                        className={`relative group flex flex-col items-center justify-center p-6 border rounded-2xl transition-all duration-300 ${localSettings.llmProvider === 'google'
                                            ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                                            : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <Zap size={32} className={`mb-3 transition-colors ${localSettings.llmProvider === 'google' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                                        <span className={`font-semibold ${localSettings.llmProvider === 'google' ? 'text-indigo-300' : 'text-slate-400'}`}>Google Gemini API</span>
                                        <span className="text-xs text-slate-500 mt-2">Cloud-based, High Accuracy</span>
                                        {localSettings.llmProvider === 'google' && (
                                            <motion.div layoutId="active-ring" className="absolute inset-0 border-2 border-indigo-500 rounded-2xl" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleChange('llmProvider', 'local')}
                                        className={`relative group flex flex-col items-center justify-center p-6 border rounded-2xl transition-all duration-300 ${localSettings.llmProvider === 'local'
                                            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                                            : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <Lock size={32} className={`mb-3 transition-colors ${localSettings.llmProvider === 'local' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                                        <span className={`font-semibold ${localSettings.llmProvider === 'local' ? 'text-emerald-300' : 'text-slate-400'}`}>Local WebLLM</span>
                                        <span className="text-xs text-slate-500 mt-2">Private, On-Device</span>
                                        {localSettings.llmProvider === 'local' && (
                                            <motion.div layoutId="active-ring" className="absolute inset-0 border-2 border-emerald-500 rounded-2xl" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={localSettings.llmProvider}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-6 overflow-hidden"
                                >
                                    <div>
                                        <label htmlFor="llmModel" className="block text-sm font-medium text-slate-400 mb-2">
                                            Model Identifier
                                        </label>
                                        <input
                                            type="text"
                                            id="llmModel"
                                            value={localSettings.llmModel}
                                            onChange={(e) => handleChange('llmModel', e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                            placeholder="e.g., gemini-2.5-flash"
                                        />
                                    </div>

                                    {localSettings.llmProvider === 'google' && (
                                        <div>
                                            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-400 mb-2">
                                                API Key
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Key size={18} className="text-slate-500" />
                                                </div>
                                                <input
                                                    type="password"
                                                    id="apiKey"
                                                    value={localSettings.apiKey}
                                                    onChange={(e) => handleChange('apiKey', e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                                                    placeholder="Enter your API key"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                                <Lock size={10} /> Your key is encrypted and stored locally.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.section>
                </div>

                {/* Action Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 flex items-center justify-end gap-4 pt-8 border-t border-slate-800/50"
                >
                    <button
                        onClick={handleReset}
                        disabled={!isDirty}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${isDirty
                            ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                            : 'text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        <RotateCcw size={18} />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty && saveStatus !== 'saved'}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${saveStatus === 'saved'
                            ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                            : isDirty
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        {saveStatus === 'saved' ? <Check size={18} /> : <Save size={18} />}
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Options;
