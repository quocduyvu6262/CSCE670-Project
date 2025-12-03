# 03. Data & Messaging

## 1. Message Passing Protocol

Communication between the Content Script, Background Worker, and Offscreen Document relies on a strictly typed messaging system.

### 1.1 `ExtensionMessage` (Discriminated Union)

All messages sent via `chrome.runtime.sendMessage` or `port.postMessage` must adhere to this type.

```typescript
export type ExtensionMessage =
  | { type: 'ANALYZE_REQUEST'; payload: { text: string; context?: string } }
  | { type: 'SOURCE_UPDATE'; payload: SourceUpdate }
  | { type: 'STREAM_START'; payload: { messageId: string } }
  | { type: 'STREAM_CHUNK'; payload: { chunk: string; messageId: string } }
  | { type: 'STREAM_COMPLETE'; payload: { messageId: string } }
  | { type: 'ERROR'; payload: { code: string; message: string } }
  | { type: 'PING'; payload: null };
```

### 1.2 `SourceUpdate` Schema

Used to update the UI with the status of a specific source during the "Live Investigation" phase.

```typescript
export interface SourceUpdate {
  url: string;
  domain: string;
  status: 'pending' | 'analyzing' | 'supports' | 'debunks' | 'neutral' | 'error';
  verdict?: string; // Short, 1-sentence reason (e.g., "Contains matching statistics")
  confidence?: number; // 0.0 - 1.0
}
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
