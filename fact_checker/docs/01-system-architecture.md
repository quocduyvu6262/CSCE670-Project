# 01. System Architecture

## 1. Overview

The "Ghost" Fact-Checker uses a distributed architecture across three isolated contexts to balance UI responsiveness, orchestration capabilities, and heavy compute requirements.

### High-Level Diagram

```mermaid
graph TD
    subgraph "Page Context (Tab)"
        User[User Selection] -->|Select Text| ContentScript
        User -->|Shortcut (Ctrl+Shift+E)| Background
        ContentScript[Content Script\n(Shadow DOM UI)]
    end

    subgraph "Extension Core"
        Background[Background Service Worker\n(Router & Orchestrator)]
        Offscreen[Offscreen Document\n(WebLLM & Parsing)]
        Options[Options Page\n(Settings)]
    end

    subgraph "External Services"
        Gemini[Google Gemini API]
        Search[Google Custom Search API]
    end

    %% Flows
    ContentScript <-->|Messages (Ports)| Background
    Background <-->|Messages| Offscreen
    Background <-->|HTTPS| Gemini
    Background <-->|HTTPS| Search
    Options -->|Chrome Storage| Background
```

## 2. Components

### 2.1 Content Script (`src/content/`)
*   **Responsibility**: Rendering the UI and capturing user intent.
*   **Key Features**:
    *   **Shadow DOM**: Uses `mode: 'open'` to isolate extension styles from the host page.
    *   **Ghost Popover**: A React application mounted inside the Shadow Root.
    *   **InvestigationView**: Renders real-time source updates (`SOURCE_UPDATE`) during the analysis phase.
    *   **VerdictView**: Renders the final streaming summary (`STREAM_CHUNK`) and verdict badge.
    *   **Event Listeners**: Listens for `selectionchange` and keyboard shortcuts (via Background).

### 2.2 Background Service Worker (`src/background/`)
*   **Responsibility**: The central orchestrator. It manages the lifecycle of a fact-check request.
*   **Key Features**:
    *   **Brain Router**: Determines execution path (Local vs. Cloud).
    *   **Orchestrator**: Manages the "Live Investigation" state machine (Search -> Fetch -> Quick Check -> Synthesis).
    *   **API Client**: Securely handles API keys and requests to Google Services.

### 2.3 Offscreen Document (`src/offscreen/`)
*   **Responsibility**: Handling tasks impossible or inefficient in a Service Worker.
*   **Key Features**:
    *   **WebGPU Inference**: Hosts the `@mlc-ai/web-llm` engine for local inference.
    *   **DOM Parsing**: Uses `Readability.js` to sanitize and parse HTML fetched from search results.

## 3. Technology Stack

*   **Runtime**: Chromium Manifest V3
*   **Language**: TypeScript 5.x
*   **Build Tool**: Vite + `@crxjs/vite-plugin`
*   **UI Framework**: React + `@floating-ui/react` + `framer-motion`
*   **Styling**: Tailwind CSS (Scoped via PostCSS/Shadow DOM)
*   **AI Engine (Local)**: `@mlc-ai/web-llm` (WebGPU)
*   **AI Engine (Cloud)**: `@google/genai` (Gemini 2.5 Flash)

## 4. Manifest Specifications

### 4.1 Permissions
*   `activeTab`: To inject the content script and access the current page title/URL.
*   `scripting`: To programmatically inject the Shadow Host.
*   `offscreen`: To create the hidden document for WebLLM and DOM parsing.
*   `storage`: To save user settings and API keys.
*   `sidePanel`: (Optional) For future history view, though currently using a Popover.
*   `commands`: For the `Ctrl+Shift+E` shortcut.

### 4.2 Host Permissions
*   `https://www.googleapis.com/*`: For Gemini and Custom Search APIs.
*   `*://*/*`: To allow fetching article content for verification (RAG).
