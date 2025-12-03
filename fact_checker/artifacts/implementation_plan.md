# Implementation Plan - "Ghost" Fact-Checker

## Goal Description
Build a Chromium (Manifest V3) extension that appears as a minimalist "Ghost" popover when text is selected, verifying facts using a hybrid AI approach. The UI will feature a **"Live Investigation"** mode where source verdicts are streamed individually before the final synthesis is presented.

## User Review Required
> [!IMPORTANT]
> **API Keys**: User will need to provide a Google Gemini API Key and Google Custom Search API Key.
> **Permissions**: Extension requires `scripting`, `offscreen`, `activeTab`, `storage`, `search`.

## Proposed Changes

### Project Structure
- **Build System**: Vite + `@crxjs/vite-plugin`
- **Language**: TypeScript 5.x (Strict Mode)
- **UI Framework**: React + `@floating-ui/react` + `framer-motion` (for animations)
- **Styling**: Tailwind CSS (injected into Shadow DOM)

### Core Components

#### [MODIFY] `src/types/messages.ts`
- Add `SOURCE_UPDATE` message type:
    ```typescript
    type SourceUpdate = {
      url: string;
      domain: string;
      status: 'analyzing' | 'supports' | 'debunks' | 'neutral';
      verdict?: string; // Short reason
    };
    ```

#### [NEW] `src/content/`
- `GhostPopover.tsx`:
    - State: `investigationSteps` (Array of SourceUpdates), `finalVerdict` (Stream).
    - Logic: Switch view from `InvestigationView` to `VerdictView` when `STREAM_START` is received.
- `components/InvestigationView.tsx`: Renders the stack of source cards.
- `components/VerdictView.tsx`: Renders the final badge and streaming text.

#### [NEW] `src/background/`
- `service-worker.ts`:
    - `orchestrateFactCheck(text)`:
        1. Search Google -> Get URLs.
        2. For each URL (parallel/limited concurrency):
            - Fetch & Parse (Offscreen).
            - **Quick Check (AI)**: "Does this support/debunk?"
            - **Emit `SOURCE_UPDATE`**.
        3. **Final Synthesis (AI)**: "Given all these sources, what is the verdict?"
        4. **Emit `STREAM_CHUNK`** for final summary.

#### [NEW] `src/offscreen/`
- `offscreen.ts`:
    - `fetchAndParse`: Returns clean text.
    - `quickCheck`: Runs a small, fast prompt for individual source verification.

### UI/UX Details
- **Investigation Phase**:
    - Sources slide in as they are processed.
    - Badges update in real-time (Spinner -> ✅/❌).
- **Synthesis Phase**:
    - Investigation view collapses.
    - Final Verdict streams in.

## Verification Plan

### Manual Verification
1.  **Trigger**: Activate extension.
2.  **Investigation Flow**:
    - Verify "Searching..." state.
    - Verify individual source cards appear and update their status (e.g., "Wikipedia" -> ✅ Supports).
3.  **Transition**: Verify smooth transition from source list to final verdict card.
4.  **Final Result**: Verify streaming text and collapsed source list in footer.
