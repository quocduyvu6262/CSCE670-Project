# 05. Security Model

## 1. Privacy & Data Handling

*   **Local First**: By default, the extension attempts to use the Local AI model (WebGPU). In this mode, the user's selected text **never leaves the device**.
*   **Cloud Opt-In**: Cloud inference (Gemini) is strictly opt-in. The user must provide their own API key.
*   **No Analytics**: The extension collects zero telemetry or usage data.

## 2. Content Security Policy (CSP)

Manifest V3 enforces a strict CSP. We require specific relaxations for WebAssembly (WebLLM).

```json
"content_security_policy": {
  "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
}
```

*   `wasm-unsafe-eval`: Required for `@mlc-ai/web-llm` to compile and run models in the Offscreen Document.

## 3. CORS & Network Requests

*   **Background Script**: All external API calls (Gemini, Google Search) are made from the Background Service Worker.
*   **Offscreen Document**: Used for fetching and parsing article HTML.
    *   *Note*: Fetching arbitrary URLs for RAG might trigger CORS. We will use the `fetch` API in the Background Script (which has host permissions) and pass the *text content* to the Offscreen Document for parsing/inference.

## 4. API Key Management

*   **Storage**: Keys are stored in `chrome.storage.local`.
*   **Encryption**: While Chrome storage is isolated to the extension, we treat keys as sensitive. They are never logged to the console.
*   **Transmission**: Keys are sent only to the respective API endpoints (generativelanguage.googleapis.com, customsearch.googleapis.com) over HTTPS.
