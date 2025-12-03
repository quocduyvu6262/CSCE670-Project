# 02. User Experience (UI/UX)

## 1. Design Philosophy

*   **"Live Investigation"**: The UI should demonstrate *work*, not just *waiting*. Users trust the result more when they see the evidence being gathered.
*   **"Traffic Light" Verdicts**: Instant cognitive recognition using standard colors (Green/Red/Amber).
*   **Fluidity**: Animations should be smooth and purposeful, bridging the gap between states.

## 2. Visual States

### 2.1 Idle State (The Trigger)
*   **Condition**: User selects > 10 characters of text.
*   **UI**: A small "✨ Check" pill floats immediately above the selection.
*   **Animation**: `FadeIn` + `SlideUp(10px)`.
*   **Interaction**: Click to activate. Alternatively, use `Ctrl+Shift+E` to bypass.

### 2.2 Investigation State (The Stream)
*   **Condition**: Analysis initiated.
*   **Header**: "Investigating..." with a pulsing gradient.
*   **Body**: A vertical stack of **Source Cards** that slide in as they are processed.
*   **Source Card Anatomy**:
    *   `[Favicon] [Domain] [Status]`
    *   **Status**:
        *   *Pending*: Grey pulse.
        *   *Analyzing*: Blue spinner.
        *   *Result*: ✅ (Supports) / ❌ (Debunks) / ⚠️ (Neutral).

### 2.3 Verdict State (The Synthesis)
*   **Condition**: All sources processed, final synthesis ready.
*   **Transition**: Source Cards collapse into a footer "Evidence Bar".
*   **Header**:
    *   **Verified**: 🛡️ Verified (Emerald Theme).
    *   **Debunked**: ⚠️ Debunked (Rose Theme).
    *   **Disputed**: ⚖️ Disputed (Amber Theme).
*   **Body**: Streaming Markdown text explaining the verdict.
*   **Footer**: Expandable list of sources (from the Investigation State). Clicking a source allows the user to see which specific source said what.

## 3. Component Hierarchy

```
<ShadowHost>
  └── <TailwindProvider>
      └── <GhostPopover>
          ├── <AnimatePresence>
          │   ├── <TriggerPill />
          │   └── <ResultCard>
          │       ├── <Header /> (Dynamic: "Investigating" -> Verdict)
          │       ├── <InvestigationView /> (Visible during analysis)
          │       │   └── <SourceList>
          │       │       └── <SourceItem /> (Animated Entry)
          │       ├── <VerdictView /> (Visible after synthesis starts)
          │       │   ├── <StreamingMarkdown />
          │       │   └── <EvidenceFooter /> (Toggle to show SourceList)
          │       └── <Actions />
```

## 4. User Flows

### Flow A: The "Pill" Activation
1.  **Select**: User highlights text.
2.  **Click**: User clicks "✨ Check".
3.  **Expand**: Pill expands into the Card.
4.  **Watch**: User watches sources appear and get verified (Live Investigation).
5.  **Read**: User reads the final streaming summary.

### Flow B: The Shortcut Activation
1.  **Select**: User highlights text.
2.  **Press**: `Ctrl+Shift+E`.
3.  **Appear**: Card fades in directly (skipping Pill).
4.  **Watch & Read**: Same as Flow A.

## 5. Styling System

*   **Font**: Inter (System Sans-Serif fallback).
*   **Theme**: Auto-detect (Light/Dark).
*   **Glassmorphism**: `bg-opacity-90` + `backdrop-blur-md` for a modern, floating feel.
*   **Z-Index**: `2147483647` (Max Safe Integer) for the Shadow Host.
