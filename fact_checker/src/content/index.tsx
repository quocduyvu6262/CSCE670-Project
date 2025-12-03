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
