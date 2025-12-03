# "Ghost" Fact-Checker: Design Documentation

**Project Goal:** Build a privacy-first, hybrid AI fact-checking extension for Chromium browsers that validates user-selected text using a "Live Investigation" flow.

## Documentation Index

| Doc ID | Title | Description |
| :--- | :--- | :--- |
| **01** | [System Architecture](./01-system-architecture.md) | High-level system design, component roles, and technology stack. |
| **02** | [User Experience](./02-user-experience.md) | Visual design, UI states, user flows, and "Live Investigation" UX. |
| **03** | [Data & Messaging](./03-data-and-messaging.md) | Message schemas, data models, and storage specifications. |
| **04** | [AI Orchestration](./04-ai-orchestration.md) | The "Brain Router" logic, prompt engineering, and RAG workflow. |
| **05** | [Security Model](./05-security-model.md) | Privacy controls, CSP, CORS, and API key management. |

## Core Philosophy

1.  **Invisible until needed**: The UI is a "Ghost" that only appears when summoned.
2.  **Privacy-First Speed**: Local AI (WebGPU) is preferred for speed and privacy.
3.  **Cloud-Backed Accuracy**: Cloud AI (Gemini) provides deep verification when needed.
4.  **Live Investigation**: The user sees the evidence building up in real-time.
