# UI/UX Design Document: "Ghost" Fact-Checker

## 1. Design Philosophy

- **"Invisible until needed"**: The UI should never obstruct the user's reading flow.
- **"Live Investigation"**: The user watches the investigation unfold in real-time. It's not just "loading"; it's "working".
- **"Traffic Light" Verdicts**: Instant visual recognition (Green/Red/Amber).
- **Modern & Fluid**: High-quality animations (Framer Motion), glassmorphism hints, and smooth transitions.

## 2. Visual States

### 2.1 The Trigger Pill (Idle)
- **Appearance**: A small, pill-shaped button floating immediately above the selection.
- **Content**: "✨ Check" (Icon + Text).
- **Animation**: Fade in + slight upward slide.
- **Behavior**: Disappears if selection is cleared or user scrolls away.

### 2.2 The "Ghost" Card (Container)
- **Container**: `bg-white/90` (Light) / `bg-slate-900/90` (Dark) with backdrop blur.
- **Border**: Thin, subtle border (`border-slate-200` / `border-slate-700`).
- **Shadow**: Deep, soft shadow (`shadow-2xl`).
- **Radius**: `rounded-2xl`.
- **Dimensions**: Width `w-[420px]`, dynamic height.

### 2.3 State: Live Investigation (The "Source Stream")
*Instead of a generic spinner, we show the AI reading sources in real-time.*

- **Header**: "Investigating..." (Pulse effect).
- **Body**: A vertical stack of **Source Cards** appearing one by one.
- **Source Card**:
    - **Layout**: `[Favicon] [Domain Name] ........ [Status Badge]`
    - **Animation**: Slide in from bottom.
    - **States**:
        - *Pending*: Grey pulse.
        - *Analyzing*: Blue spinner.
        - *Result*:
            - ✅ **Supports**: Emerald badge.
            - ❌ **Debunks**: Rose badge.
            - ⚠️ **Neutral/Irrelevant**: Slate badge.
- **Behavior**: As new sources are checked, they stack up. The user sees the "evidence" building up before the final conclusion.

### 2.4 State: Final Verdict (Synthesis)
*Once enough evidence is gathered, the UI transitions to the final answer.*

- **Transition**: The "Source Stream" collapses/minimized into an "Evidence" section at the bottom.
- **Header**:
    - **Verified**: 🛡️ Verified (Emerald-600).
    - **Debunked**: ⚠️ Debunked (Rose-600).
    - **Disputed**: ⚖️ Disputed (Amber-600).
- **Body**:
    - **Streaming Summary**: The final verdict text streams in token-by-token (typewriter effect).
- **Footer (Collapsed Evidence)**:
    - A row of small favicons representing the sources analyzed.
    - Clicking expands to show the detailed "Source Cards" from the previous step.

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

### Flow: The Investigation
1.  **Activation**: User clicks Pill or uses Shortcut.
2.  **Phase 1 (Search)**: "Searching for context..."
3.  **Phase 2 (Source Stream)**:
    - *Card 1 appears*: "nytimes.com" -> Analyzing -> ✅ Supports.
    - *Card 2 appears*: "snopes.com" -> Analyzing -> ✅ Supports.
    - *Card 3 appears*: "random-blog.com" -> Analyzing -> ❌ Contradicts.
4.  **Phase 3 (Synthesis)**:
    - Source cards shrink/collapse to bottom.
    - **Final Verdict Badge** pops in: "🛡️ Verified".
    - Summary text streams: "Multiple reliable sources confirm that..."
5.  **Interaction**: User can click the collapsed sources to see which specific source said what.

## 5. Styling Guidelines

- **Modern Aesthetic**:
    - **Typography**: Inter (clean, legible).
    - **Glassmorphism**: Subtle `backdrop-filter: blur(12px)` for the card background.
    - **Micro-interactions**: Hover states on source cards, smooth height adjustments.
    - **Colors**:
        - **Verified**: `text-emerald-700 bg-emerald-50 border-emerald-200`.
        - **Debunked**: `text-rose-700 bg-rose-50 border-rose-200`.
    - **Icons**: `lucide-react` for consistent, clean iconography.
