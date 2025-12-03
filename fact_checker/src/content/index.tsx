import React from 'react';
import { createRoot } from 'react-dom/client';
import { GhostPopover } from './GhostPopover';
import styles from './style.css?inline';

const HOST_ID = 'ghost-fact-checker-host';

function init() {
    if (document.getElementById(HOST_ID)) return;

    const host = document.createElement('div');
    host.id = HOST_ID;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    shadow.appendChild(styleSheet);

    const root = document.createElement('div');
    root.id = 'root';
    shadow.appendChild(root);

    createRoot(root).render(
        <React.StrictMode>
            <GhostPopover />
        </React.StrictMode>
    );
}

init();

// Listen for trigger requests from background
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'TRIGGER_CHECK_REQUEST') {
        const selection = window.getSelection()?.toString();
        if (selection) {
            console.log('Selected text:', selection);
            chrome.runtime.sendMessage({ type: 'TRIGGER_CHECK', text: selection });
        } else {
            console.log('No text selected');
        }
    }
});
