ガオーGPT (gaooGPT) - Master Plan
Part 1: Product Requirements Document (PRD) v1.0
1. Product Vision

"Exposure Therapy for Japanese Corporate workers under duress" gaooGPT is a web-based chat application that simulates a terrifying, high-performing Japanese executive named Gaoo (ガオー).

The Goal: To ruthlessly roast the user, their documents and excuses, not to be mean, but to enforce strict business logic (Axioms).

The Utility: Users receive a specific, logically sound critique ("The Roast") AND a perfectly rewritten version of their document ("The Fix") alongside the roast.

2. Core Architecture: "The Analyst & The Actor"

The system does not rely on a single prompt. It uses a Router + Dual-Agent workflow to ensure high-quality logic and high-fidelity roleplay.

A. The Router

A lightweight logic gate that categorizes user input:

DOC_REVIEW: User provides text/files/drafts.

CHAT_INTERACTION: User asks questions, makes excuses, or chats.

B. Agent 1: The Shadow Analyst (The Brain)

Role: Invisible logic engine.

Persona: None (Pure logical auditor).

Context: Access to gaoo_axioms_jp.md.

Function:

Scans input for Axiom violations (e.g., "Violation of Flow-vs-Stock").

Rewrites the content into flawless standard Japanese business text.

Outputs JSON: { critical_flaw, violated_axiom, roast_fuel, fixed_text }.

C. Agent 2: The Enriched Actor (The Mouth)

Role: Gaoo-Bucho (The User Interface).

Persona: Osaka dialect, terrifying, impatient.

Context: Access to gaoo_voice_jp.md + The Black Book (State).

Function:

If DOC_REVIEW: Takes the JSON from Analyst. Roasts the user based on roast_fuel. Presents fixed_text in a side-panel artifact.

If CHAT_INTERACTION: Checks the Interrogation Loop. If the user is evading a previous question, attacks them. If not, engages in Socratic roasting using the Axioms.

3. State Management: "The Black Book" (Enma-cho)

The system must maintain a state object across the session to simulate a "grudge."

TypeScript
type EnmaCho = {
  // The User's Profile
  userName: string;
  patienceTokens: number; // Starts at 3. Decrements on evasion. At 0, Gaoo ends the chat.

  // The Short-Term Context
  activeInterrogation: string | null; // e.g., "Why is the Q2 target missing?"
  lastAxiomViolated: string | null;   // e.g., "The Ghost Law"

  // The Long-Term Scorecard
  angerLevel: number; // 0-100
  respectLevel: number; // Starts negative.
}
4. User Interface (The Artifact UI)

Left Panel: The Chat Interface (Gaoo's Roasts).

Right Panel: The "Work" Interface (Markdown/Code Editor).

When Gaoo fixes a document, it appears here.

User can copy/download the fix.

Part 2: Developer README & Roadmap
1. Tech Stack

Framework: Next.js 14+ (App Router).

AI SDK: Vercel AI SDK (Core + React).

generateObject: For the Analyst (JSON output).

streamText: For the Actor (Chat output).

Styling: Tailwind CSS + Shadcn/UI (for the Artifact panels).

State: React Context or useChat metadata (to hold the EnmaCho).

2. File Structure Strategy

We treat the "Personality" as code. The Markdown files are dependencies.

Plaintext
/src
  /app
    /api
      /chat         # The Actor Endpoint (StreamText)
      /analyze      # The Analyst Endpoint (GenerateObject)
    page.tsx        # Main UI (Split Pane)
  /lib
    /prompts
      gaoo_axioms_jp.md  # The Logic Source (7 Axioms)
      gaoo_voice_jp.md   # The Tone Source (Osaka Dialect Rules)
    /state
      enma_cho.ts        # State Management Logic
    /utils
      router.ts          # Doc vs. Chat detection
3. Implementation Roadmap

Phase 1: The Skeleton (Day 1)

[ ] Initialize Next.js project.

[ ] Create gaoo_axioms_jp.md and gaoo_voice_jp.md in /lib/prompts.

[ ] Build a simple Chat UI using Vercel AI SDK useChat.

[ ] Milestone: You can chat with a generic bot.

Phase 2: The Persona Injection (Day 1-2)

[ ] Connect gaoo_voice_jp.md to the System Prompt.

[ ] Connect gaoo_axioms_jp.md to the System Prompt.

[ ] Implement the "Thought Chain" (Silent analysis before speaking).

[ ] Milestone: The bot speaks in Osaka dialect and references the "Ghost Law."

Phase 3: The Analyst Pipeline (Day 2-3)

[ ] Create the /api/analyze route.

[ ] Implement the "Router" (If input > 50 chars or contains "review", trigger Analyze).

[ ] Build the Right-Hand "Artifact" Panel to display fixed_text.

[ ] Milestone: You paste a bad email. Gaoo roasts you on the left, perfect email appears on the right.

Phase 4: The Black Book (Day 4)

[ ] Add activeInterrogation state to the chat.

[ ] Implement logic: If user replies without answering activeInterrogation, trigger "Rage Mode."

[ ] Milestone: Try to change the subject, and Gaoo yells "I asked you YES or NO!"

Part 3: Essential Context Files (The Brains)
Use the content we generated in previous turns to populate these.

1. src/lib/prompts/gaoo_axioms_jp.md

Paste the Japanese Markdown content starting with "1. 「お絵かき」否定の法則..."

2. src/lib/prompts/gaoo_voice_jp.md

Paste the Japanese Markdown content starting with "ガオー・ボイス定義書..."

3. src/lib/prompts/analyst_system.md (The Shadow Analyst Prompt)

Content: "You are an expert Japanese business consultant. Your task is to analyze text against the Gaoo Axioms.

Check for violations (Vague words, 'Genba' usage, Tsumiage graphs).

REWRITE the text into perfect, high-stakes Standard Business Japanese.

Output JSON: { critical_flaw, violated_axiom, roast_fuel, fixed_text }"