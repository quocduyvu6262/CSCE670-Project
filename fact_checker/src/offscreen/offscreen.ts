console.log('Offscreen document loaded');

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    console.log('Offscreen received message:', message);
});
