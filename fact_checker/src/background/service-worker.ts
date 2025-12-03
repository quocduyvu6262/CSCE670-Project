import { Message, SourceUpdate } from '../types/messages';

console.log('Ghost Fact-Checker Background Service Worker Loaded');

const API_BASE_URL = 'http://localhost:5001';

// Helper function to safely send messages to tabs
async function sendMessageToTab(tabId: number, message: any): Promise<boolean> {
    try {
        await chrome.tabs.sendMessage(tabId, message);
        return true;
    } catch (error: any) {
        // Tab might be closed, content script not loaded, or page navigated away
        if (error.message?.includes('Receiving end does not exist') || 
            error.message?.includes('Could not establish connection')) {
            console.warn(`Could not send message to tab ${tabId}:`, error.message);
            return false;
        }
        console.error(`Error sending message to tab ${tabId}:`, error);
        return false;
    }
}

// Helper function to check if tab still exists
async function isTabValid(tabId: number): Promise<boolean> {
    try {
        const tab = await chrome.tabs.get(tabId);
        return !!tab;
    } catch {
        return false;
    }
}

chrome.commands.onCommand.addListener((command) => {
    if (command === 'trigger-fact-check') {
        console.log('Triggering fact check via shortcut');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab?.id) {
                sendMessageToTab(activeTab.id, { type: 'TRIGGER_CHECK_REQUEST' }).catch(console.error);
            }
        });
    }
});

chrome.runtime.onMessage.addListener((message: Message, _sender, _sendResponse) => {
    if (message.type === 'TRIGGER_CHECK') {
        console.log('Received fact check request for:', message.text);

        const tabId = _sender.tab?.id;
        if (!tabId) {
            console.error('No tab ID available');
            return;
        }

        // 1. Send Trigger Confirmation to show UI
        sendMessageToTab(tabId, { type: 'TRIGGER_CHECK', text: message.text }).catch(console.error);

        // 2. Call the Flask API
        fetch(`${API_BASE_URL}/fact-check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                claim: message.text,
                top_k: 5
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(async (data) => {
            console.log('API Response:', data);

            // Check if tab is still valid before processing
            const isValid = await isTabValid(tabId);
            if (!isValid) {
                console.warn('Tab is no longer valid, aborting fact-check');
                return;
            }

            // 3. Process sources - send analyzing status first, then actual results
            const sources = data.sources || [];
            
            sources.forEach((source: any, index: number) => {
                // Send analyzing status first
                const analyzingSource: SourceUpdate = {
                    url: source.url,
                    domain: source.domain,
                    status: 'analyzing',
                    verdict: 'Checking...'
                };
                
                sendMessageToTab(tabId, { 
                    type: 'SOURCE_UPDATE', 
                    payload: analyzingSource 
                }).catch(console.error);

                // Update to actual result after a short delay (for visual effect)
                setTimeout(async () => {
                    // Check if tab is still valid before sending update
                    const stillValid = await isTabValid(tabId);
                    if (!stillValid) {
                        console.warn('Tab closed during source update');
                        return;
                    }

                    const finalSource: SourceUpdate = {
                        url: source.url,
                        domain: source.domain,
                        status: source.status as 'supports' | 'debunks' | 'neutral',
                        verdict: source.verdict,
                        quote: source.quote
                    };
                    
                    sendMessageToTab(tabId, { 
                        type: 'SOURCE_UPDATE', 
                        payload: finalSource 
                    }).catch(console.error);
                }, 500 + (index * 200)); // Stagger the updates
            });

            // 4. Start streaming verdict after all sources are processed
            setTimeout(async () => {
                // Check if tab is still valid before streaming
                const stillValid = await isTabValid(tabId);
                if (!stillValid) {
                    console.warn('Tab closed before verdict streaming');
                    return;
                }

                sendMessageToTab(tabId, { type: 'STREAM_START' }).catch(console.error);

                const verdict = data.verdict || 'Analysis complete.';
                let charIndex = 0;
                const streamInterval = setInterval(async () => {
                    // Check if tab is still valid before each chunk
                    const stillValid = await isTabValid(tabId);
                    if (!stillValid) {
                        clearInterval(streamInterval);
                        console.warn('Tab closed during verdict streaming');
                        return;
                    }

                    if (charIndex < verdict.length) {
                        sendMessageToTab(tabId, { 
                            type: 'STREAM_CHUNK', 
                            chunk: verdict[charIndex] 
                        }).catch(console.error);
                        charIndex++;
                    } else {
                        clearInterval(streamInterval);
                        sendMessageToTab(tabId, { type: 'STREAM_END' }).catch(console.error);
                    }
                }, 30); // 30ms per character for smooth streaming
            }, 1000 + (sources.length * 200)); // Wait for all source updates
        })
        .catch(async (error) => {
            console.error('Error calling fact-check API:', error);
            
            // Check if tab is still valid before sending error
            const isValid = await isTabValid(tabId);
            if (isValid) {
                sendMessageToTab(tabId, { 
                    type: 'ERROR', 
                    error: `Failed to fact-check: ${error.message}. Make sure the Flask API is running on ${API_BASE_URL}` 
                }).catch(console.error);
            }
        });
    }
});