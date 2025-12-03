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

chrome.runtime.onMessage.addListener((message: Message, _sender, _sendResponse) => {
    if (message.type === 'TRIGGER_CHECK') {
        console.log('Received fact check request for:', message.text);

        // Mock Orchestration for UI Testing
        const tabId = _sender.tab?.id;
        if (!tabId) return;

        // 1. Send Trigger Confirmation
        chrome.tabs.sendMessage(tabId, { type: 'TRIGGER_CHECK', text: message.text });

        // 2. Simulate Source Updates
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
                chrome.tabs.sendMessage(tabId, { type: 'SOURCE_UPDATE', payload: mockSources[currentStep] });

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
                    chrome.tabs.sendMessage(tabId, { type: 'SOURCE_UPDATE', payload: updated });
                }, 1500);

                step++;
            } else {
                clearInterval(interval);
                // 3. Start Synthesis
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, { type: 'STREAM_START' });

                    // Stream text
                    const verdict = "Based on multiple reliable sources, this claim appears to be **accurate**. The New York Times and Snopes both confirm the details, although one blog post presents conflicting information that lacks citations.";
                    let charIndex = 0;
                    const streamInterval = setInterval(() => {
                        if (charIndex < verdict.length) {
                            chrome.tabs.sendMessage(tabId, { type: 'STREAM_CHUNK', chunk: verdict[charIndex] });
                            charIndex++;
                        } else {
                            clearInterval(streamInterval);
                            chrome.tabs.sendMessage(tabId, { type: 'STREAM_END' });
                        }
                    }, 30);
                }, 2000);
            }
        }, 1000);
    }
});
