import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
    manifest_version: 3,
    name: '"Ghost" Fact-Checker',
    version: '1.0.0',
    description: 'A privacy-first, hybrid AI fact-checking extension.',
    permissions: [
        'activeTab',
        'scripting',
        'offscreen',
        'storage',
        'search',
        'commands'
    ],
    host_permissions: [
        'https://www.googleapis.com/*',
        '*://*/*'
    ],
    background: {
        service_worker: 'src/background/service-worker.ts',
        type: 'module',
    },
    content_scripts: [
        {
            matches: ['<all_urls>'],
            js: ['src/content/index.tsx'],
        },
    ],
    commands: {
        "trigger-fact-check": {
            "suggested_key": {
                "default": "Ctrl+Shift+E",
                "mac": "Command+Shift+E"
            },
            "description": "Trigger Ghost Fact-Check"
        }
    },
    action: {
        "default_title": "Ghost Fact-Checker",
        "default_popup": "src/popup/index.html"
    },
    options_ui: {
        page: "src/options/index.html",
        open_in_tab: true
    }
})
