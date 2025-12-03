# Architecture Document: "Ghost" Fact-Checker

## 1. System Overview

The "Ghost" Fact-Checker is a Manifest V3 Chromium extension designed for privacy-first, hybrid AI fact-checking. It leverages a distributed architecture across three main contexts: **Content Scripts** (UI), **Background Service Worker** (Orchestration), and **Offscreen Document** (Heavy Compute/WebGPU).

### High-Level Architecture

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

## 2. Component Architecture

### 2.1 Content Script (`src/content/`)
- **Role**: Renders the "Ghost" UI and captures user input.
- **Key Components**:
    - `ShadowHost`: Creates the Shadow DOM root to isolate styles.
    - `GhostPopover`: The main React component using `@floating-ui/react`.
    - `InvestigationView`: Renders real-time source updates (`SOURCE_UPDATE`).
    - `VerdictView`: Renders the final streaming summary (`STREAM_CHUNK`).
- **Isolation**: Uses Shadow DOM (`mode: 'open'`) and injects a scoped Tailwind CSS stylesheet.

### 2.2 Background Service Worker (`src/background/`)
- **Role**: The central nervous system. Routes requests, manages state, and handles external API calls.
- **Key Modules**:
    - `BrainRouter`: Decides whether to use Local AI or Cloud AI.
    - `Orchestrator`: Manages the "Live Investigation" flow (Search -> Parallel Quick Checks -> Final Synthesis).
    - `CloudAgent`: Client for `@google/genai`.
    - `SearchAgent`: Client for Google Custom Search.

### 2.3 Offscreen Document (`src/offscreen/`)
- **Role**: A hidden HTML document used for capabilities not available in Service Workers.
- **Responsibilities**:
    - **WebGPU Inference**: Runs `@mlc-ai/web-llm` (Phi-3/Llama-3).
    - **DOM Parsing**: Uses `Readability.js` to clean HTML fetched from search results.
    - **Quick Check**: Runs lightweight prompts to verify individual sources.

## 3. Data Flow & Message Passing

Communication relies on a strictly typed messaging system defined in `src/types/messages.ts`.

### 3.1 Live Investigation Flow (RAG)
1.  **Trigger**: User selects text -> `START_CHECK`.
2.  **Search**: Background calls Google Search API -> gets URLs.
3.  **Source Verification Loop** (Parallel):
    *   **Fetch**: Background fetches HTML -> sends to Offscreen.
    *   **Parse**: Offscreen cleans HTML.
    *   **Quick Check**: AI determines if source supports/debunks claim.
    *   **Update**: Background emits `SOURCE_UPDATE` to Content Script.
    *   **UI**: Content Script displays source card with verdict (✅/❌).
4.  **Final Synthesis**:
    *   **Aggregator**: Background collects all source verdicts and text chunks.
    *   **Synthesis**: AI generates final verdict and summary.
    *   **Stream**: Background emits `STREAM_CHUNK` messages to Content Script.
    *   **UI**: Content Script transitions to Verdict View and streams text.

## 4. Security & Privacy

- **API Keys**: Stored in `chrome.storage.local`. Never exposed to Content Scripts.
- **CORS**: All external requests (Gemini, Search, Fetching) originate from the Background Script or Offscreen.
- **CSP**: `manifest.json` must allow `wasm-unsafe-eval` for WebLLM.
- **Local AI**: When "Local" is selected, no text data leaves the device.

## 5. Data Models

### `Message` (Discriminated Union)

```typescript
type Message =
    | { type: 'TRIGGER_CHECK_REQUEST' }
    | { type: 'START_CHECK'; text: string }
    | { type: 'SOURCE_UPDATE'; payload: SourceUpdate }
    | { type: 'STREAM_START' }
    | { type: 'STREAM_CHUNK'; chunk: string }
    | { type: 'STREAM_END' }
    | { type: 'ERROR'; error: string };
```

### `SourceUpdate`

```typescript
type SourceUpdate = {
    url: string;
    domain: string;
    status: 'analyzing' | 'supports' | 'debunks' | 'neutral';
    verdict?: string; // Short reason (e.g., "Contains matching statistics")
    quote?: string; // Relevant quote from the source
};
```

### `FactCheckResult`

```typescript
interface FactCheckResult {
    verdict: 'verified' | 'debunked' | 'disputed' | 'info';
    confidence: number; // 0.0 - 1.0
    summary: string;
    sources: Array<SourceUpdate>;
}
```
