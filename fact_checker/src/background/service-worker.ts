import { Message, SourceUpdate } from '../types/messages';

console.log('Ghost Fact-Checker Background Service Worker Loaded');

chrome.commands.onCommand.addListener((command) => {
    if (command === 'trigger-fact-check') {
        console.log('Triggering fact check via shortcut');
        // Logic to get selected text and start orchestration
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab?.id) {
                chrome.tabs.sendMessage(activeTab.id, { type: 'TRIGGER_CHECK_REQUEST' });
            }
        });
    }
});

chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'ghost-stream') {
        console.log('Ghost Stream connected');

        port.onMessage.addListener((message: Message) => {
            if (message.type === 'START_CHECK') {
                console.log('Received fact check request for:', message.text);

                // Mock Orchestration for UI Testing

                // 0. Simulated Error Trigger for Testing
                if (message.text.toLowerCase().includes('error')) {
                    console.log('Simulating error based on trigger word');
                    setTimeout(() => {
                        try {
                            port.postMessage({ type: 'ERROR', error: 'Simulated error for testing purposes.' });
                        } catch (e) {
                            console.error('Failed to send error message', e);
                        }
                    }, 1000);
                    return;
                }

                // 1. Simulate Source Updates
                const mockSources: SourceUpdate[] = [
                    { url: 'https://nytimes.com/article1', domain: 'nytimes.com', status: 'analyzing', verdict: 'Checking...' },
                    { url: 'https://snopes.com/fact-check/1', domain: 'snopes.com', status: 'analyzing', verdict: 'Checking...' },
                    { url: 'https://random-blog.com/post', domain: 'random-blog.com', status: 'analyzing', verdict: 'Checking...' },
                ];

                let step = 0;
                const interval = setInterval(() => {
                    if (step < mockSources.length) {
                        // Send analyzing
                        const currentStep = step;
                        try {
                            port.postMessage({ type: 'SOURCE_UPDATE', payload: mockSources[currentStep] });
                        } catch (e) {
                            console.log('Port disconnected');
                            clearInterval(interval);
                            return;
                        }

                        // Update to result after a delay
                        setTimeout(() => {
                            const updated = { ...mockSources[currentStep] };
                            if (currentStep === 0) {
                                updated.status = 'supports';
                                updated.verdict = 'Confirms claim';
                                updated.quote = 'The data clearly shows a 50% increase in renewable energy adoption.';
                            }
                            else if (currentStep === 1) {
                                updated.status = 'supports';
                                updated.verdict = 'Verified true';
                                updated.quote = 'Our investigation found no evidence to support the opposing view.';
                            }
                            else {
                                updated.status = 'debunks';
                                updated.verdict = 'Contradicts data';
                                updated.quote = 'Official records indicate a decline, not an increase.';
                            }
                            try {
                                port.postMessage({ type: 'SOURCE_UPDATE', payload: updated });
                            } catch (e) {
                                // Port likely disconnected
                            }
                        }, 1500);

                        step++;
                    } else {
                        clearInterval(interval);
                        // 3. Start Synthesis
                        setTimeout(() => {
                            try {
                                port.postMessage({ type: 'STREAM_START' });

                                // Stream text
                                const verdict = "Based on multiple reliable sources, this claim appears to be **accurate**. The New York Times and Snopes both confirm the details, although one blog post presents conflicting information that lacks citations.";
                                let charIndex = 0;
                                const streamInterval = setInterval(() => {
                                    if (charIndex < verdict.length) {
                                        try {
                                            port.postMessage({ type: 'STREAM_CHUNK', chunk: verdict[charIndex] });
                                            charIndex++;
                                        } catch (e) {
                                            clearInterval(streamInterval);
                                        }
                                    } else {
                                        clearInterval(streamInterval);
                                        try {
                                            port.postMessage({ type: 'STREAM_END' });
                                        } catch (e) { }
                                    }
                                }, 30);
                            } catch (e) {
                                console.error('Error during synthesis:', e);
                                try {
                                    port.postMessage({ type: 'ERROR', error: 'An error occurred during verdict synthesis.' });
                                } catch (sendError) { }
                            }
                        }, 2000);
                    }
                }, 1000);

                port.onDisconnect.addListener(() => {
                    console.log('Port disconnected, cleaning up');
                    clearInterval(interval);
                });
            }
        });
    }
});
