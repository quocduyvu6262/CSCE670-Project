import { useState, useEffect } from 'react';

export interface Settings {
    enabled: boolean;
    showCheckPill: boolean;
    llmProvider: 'google' | 'local';
    llmModel: string;
    apiKey: string;
}

const DEFAULT_SETTINGS: Settings = {
    enabled: true,
    showCheckPill: true,
    llmProvider: 'google',
    llmModel: 'gemini-2.5-flash',
    apiKey: '',
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        chrome.storage.sync.get(DEFAULT_SETTINGS as unknown as { [key: string]: any }, (items) => {
            setSettings(items as unknown as Settings);
            setLoading(false);
        });

        const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName === 'sync') {
                setSettings((prevSettings) => {
                    const newSettings = { ...prevSettings };
                    let hasChanges = false;
                    for (const key in changes) {
                        if (key in DEFAULT_SETTINGS) {
                            // @ts-ignore
                            newSettings[key as keyof Settings] = changes[key].newValue;
                            hasChanges = true;
                        }
                    }
                    return hasChanges ? newSettings : prevSettings;
                });
            }
        };

        chrome.storage.onChanged.addListener(handleChange);
        return () => {
            chrome.storage.onChanged.removeListener(handleChange);
        };
    }, []);

    const updateSettings = (newSettings: Partial<Settings>) => {
        chrome.storage.sync.set(newSettings);
        setSettings((prev) => ({ ...prev, ...newSettings }));
    };

    return { settings, loading, updateSettings };
};
