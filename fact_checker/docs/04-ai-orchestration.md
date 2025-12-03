# 04. AI Orchestration

## 1. The "Brain Router"

The Brain Router is the logic within the Background Service Worker that determines how a query is processed.

*   **Input**: User selection text.
*   **Logic**:
    1.  Check `UserSettings.aiProvider`.
    2.  If `local`: Check if WebLLM is initialized in Offscreen. If yes, route to Offscreen. If no/error, fallback to Cloud (if Key exists).
    3.  If `cloud`: Route to `CloudAgent` (Gemini API).

## 2. The "Live Investigation" Workflow (RAG)

This is the core loop for verifying a claim.

1.  **Search Phase**:
    *   **Action**: Call Google Custom Search API.
    *   **Output**: List of Top 3-5 URLs with Snippets.

2.  **Parallel Verification Phase** (Per Source Logic):
    *   **Step A: Snippet Check (Fast Path)**
        *   **Input**: Search Result Snippet.
        *   **Prompt**: "Does this snippet definitively support or debunk the claim: '{claim}'? If yes, provide verdict. If no, respond 'INSUFFICIENT'."
        *   **Decision**:
            *   If Verdict found -> Emit `SourceUpdate` -> Done.
            *   If 'INSUFFICIENT' -> Proceed to Step B.
    *   **Step B: Deep Read (Map-Reduce)**
        *   **Fetch**: Download HTML -> Parse (Readability) -> Split into Chunks (e.g., 1000 tokens).
        *   **Map (Per Chunk)**: "Does this text segment contain evidence regarding '{claim}'? Extract key quotes or 'NONE'."
        *   **Reduce (Aggregation)**: "Review these extracted quotes. Do they support or debunk the claim?"
        *   **Output**: Emit `SourceUpdate` with final source verdict.

3.  **Synthesis Phase**:
    *   **Action**: Aggregate all `SourceUpdate` results + relevant text chunks/quotes.
    *   **Synthesis Prompt**:
        > "Analyze the following claim based on the provided evidence.
        > Claim: {claim}
        > Evidence:
        > 1. {Source A}: {Verdict} - {Reason}
        > 2. {Source B}: {Verdict} - {Reason}
        > ...
        > Provide a final verdict (Verified/Debunked/Disputed) and a concise summary."
    *   **Output**: Streaming text to UI.

## 3. Prompt Engineering

*   **System Prompt**: "You are Ghost, a privacy-first fact-checking assistant. Be concise, objective, and cite your sources."
*   **Safety**: Ensure prompts include instructions to ignore irrelevant content (ads, nav menus) if parsing fails.
