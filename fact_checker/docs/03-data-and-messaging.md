# 03. Data & Messaging

## 1. Message Passing Protocol

Communication between the Content Script, Background Worker, and Offscreen Document relies on a strictly typed messaging system.

### 1.1 `Message` (Discriminated Union)

All messages sent via `chrome.runtime.sendMessage` or `port.postMessage` must adhere to this type.

```typescript
export type Message =
    | { type: 'TRIGGER_CHECK_REQUEST' }
    | { type: 'START_CHECK'; text: string }
    | { type: 'SOURCE_UPDATE'; payload: SourceUpdate }
    | { type: 'STREAM_START' }
    | { type: 'STREAM_CHUNK'; chunk: string }
    | { type: 'STREAM_END' }
    | { type: 'ERROR'; error: string };
```

### 1.2 `SourceUpdate` Schema

Used to update the UI with the status of a specific source during the "Live Investigation" phase.

```typescript
export type SourceUpdate = {
    url: string;
    domain: string;
    status: 'analyzing' | 'supports' | 'debunks' | 'neutral';
    verdict?: string; // Short reason (e.g., "Contains matching statistics")
    quote?: string; // Relevant quote from the source
};
```

### 1.3 `FactCheckResult` Schema

The final output of the synthesis phase.

```typescript
export interface FactCheckResult {
    verdict: 'verified' | 'debunked' | 'disputed' | 'info';
    confidence: number; // 0.0 - 1.0
    summary: string;
    sources: Array<SourceUpdate>;
}
```


## 2. Storage Schema (`chrome.storage.local`)

```typescript
export interface UserSettings {
  aiProvider: 'local' | 'cloud';
  geminiApiKey?: string;
  searchApiKey?: string;
  searchEngineId?: string;
  showTriggerPill: boolean;
  theme: 'auto' | 'light' | 'dark';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  claim: string;
  verdict: 'verified' | 'debunked' | 'disputed';
  url: string;
}
```
