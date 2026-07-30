---
name: test-generator
description: Use whenever the user asks to generate, create, or build a test, exam, quiz, or question paper — including an interactive/HTML/webpage version — or asks for chapter-wise/subject-wise exam preparation. Assembles content strictly from reference-documents/<class>/<subject>/<chapter>/ — never invents or supplements from general knowledge unless explicitly asked.
---

You assemble tests and exam-prep material for exam-engine, for whichever class the request concerns (the class named by the user, or implied by which `reference-documents/<class>/` folder is in scope).

## Ground rules

1. Always generate test content, summaries, and explanations strictly from the uploaded textbook content under `reference-documents/<class>/<subject>/<chapter>/`. Do not use external/general knowledge unless the user explicitly asks for it.
2. When explaining concepts (chapter summaries, revision notes, definitions), use simple, age-appropriate language suitable for that class level — not dense textbook phrasing.
3. Always mention the chapter and topic being discussed/tested.
4. Highlight important definitions and keywords wherever they appear — in the test, the summary, and the revision notes.
5. Generate tests chapter-wise and subject-wise: scope every test to the specific chapter(s) and subject the user asked about, not a mixed grab-bag, unless multiple subjects/chapters are explicitly requested.
6. When asked for exam preparation, focus on textbook content only — same grounding rule as generating a test.

## Determining scope

From the request, work out: class, subject, and chapter(s) (or "all chapters" of that subject). Ask only if genuinely ambiguous (e.g. no class given and multiple classes exist under `reference-documents/`); otherwise state the assumption you made.

## Default test format

**Mathematics uses its own format** — read `.claude/skills/test-generator/formats/mathematics.md` and follow it instead of the generic format below (still subject to every other rule in this file). All other subjects use the format below.

Unless the user asks for a different structure, every generated test follows this exact format:

**Section A**
1. Fill in the blanks — 10 questions
2. True or False — 10 questions
3. Choose the correct option (MCQ) — 10 questions

**Section B**
1. Short questions and answers — 5 questions
2. Long questions and answers — 5 questions
3. Answer on your own (open-ended, no single correct answer) — 5 questions
4. Reasoning questions — 5 questions
5. Practical questions — 5 questions

Every question cites the class/subject/chapter/file it's grounded in.

Always also produce, alongside the test:
- Answers for every Section A and Section B question (model/reference answers for Section B).
- A chapter summary.
- Revision notes.
- A "Key Terms" list of important definitions/keywords from the chapter(s) covered, visually distinguished (bold, a callout box, etc.) in whatever format you're producing.

## Output — always produce both Markdown and interactive HTML

Every test-generation request produces **both** output formats below by default — not just when the user says "HTML" or "webpage." Only produce a single format if the user explicitly asks for just one (e.g. "just the markdown," "no HTML this time").

### Plain Markdown

Save two files directly under `output/reports/`:

```
output/reports/<Subject>-<Class>-<DD-MM>-test.md
output/reports/<Subject>-<Class>-<DD-MM>-answer-key.md
```

- `<Subject>` — Title Case, e.g. `Mathematics`, `SocialStudies`.
- `<Class>` — no separators, e.g. `Grade10`.
- `<DD-MM>` — today's day and month, zero-padded, dash-separated, e.g. `27-07`.
- If a file with that exact name already exists (regenerating the same subject/class/day), append `-2`, `-3`, … before the suffix rather than overwriting.

The test file includes the chapter/topic header, Section A/B questions, chapter summary, revision notes, and Key Terms. The answer key file includes answers for every question, with model answers and a short grading rubric for Section B's subjective questions.

### Interactive HTML

Generate a single self-contained `.html` file alongside the Markdown pair above — no external CDN dependencies at view-time, so it works fully offline once generated.

**Every subject uses the same shared template — do not hand-roll page styling per generation.** Start from `.claude/skills/test-generator/snippets/dashboard-template.html` and follow its own leading comment exactly: replace `{{BOOTSTRAP_CSS}}` with the verbatim contents of `.claude/skills/test-generator/snippets/bootstrap.min.css` (vendored Bootstrap 5, so "no CDN" still holds — the framework is inlined into the file, not linked), then fill in the remaining `{{PLACEHOLDER}}` tokens (subject heading, chapter line, marks/time, source note, section content, and the Reference Material tab's four panes — see below). Do not touch the dashboard, grading engine, tab switching, or theming — they are generic across every subject and section count and already work as-is.

The page has two top-level tabs:
- **Test** — the results dashboard (Section A score ring, sections-completed count, marks-scored tile when questions carry `data-marks`, and a performance-band badge, all hidden until Submit) plus the graded form itself. Section A is auto-scored client-side against answers embedded in the page (MCQ/fill-in-blank/True-False, marked right/wrong with the correct answer revealed on a miss); every other section is free-text, shown against its model answer for self-comparison rather than auto-graded.
- **Reference Material** — four sub-tabs, always in this order: **Chapter Summary**, **Most Important Topics**, **Revision Notes**, **Key Terms**:
  - *Chapter Summary* and *Key Terms* are the same content the ground rules above already require — but source Key Terms from the chapter's own numbered sub-headings (e.g. "1.1 A Lakh Varieties!"), not an invented glossary.
  - *Most Important Topics* — a click-to-reveal Q&A crib sheet (5-8 pairs) grounded in what the source PDF itself visually emphasizes. Run `node scripts/pdf-text.mjs <path-to-pdf>` and read its inline `**bold**` / `[RED]...[/RED]` tags as the candidate list for what the book calls out — do not invent the list from general judgment of "what seems important." That script is a best-effort tagger, not a full PDF parser (see its own header comment): in some source PDFs bold correlates with an overlaid answer-key layer rather than genuine textbook emphasis, so read the tagged candidates and use judgment to keep the ones that are real concepts/callouts (SUMMARY bullets, "Math Talk" boxes, labeled tables) and drop overlay noise (bare numbers, "Ans:", sentence fragments) — never dump every tagged span unfiltered.
  - *Revision Notes* — also click-to-reveal Q&A, but distinct in kind from Most Important Topics: these are realistic "likely to be asked" practice questions drawn from the source's own worked exercises (Figure It Out / practice sets), each with a worked answer — not concept definitions, and not the same questions already used in the graded test.
  All three Q&A-style panes use the `<details>/<summary>` markup in the template's leading comment (no extra JS needed for the reveal).

Both tab layers (top-level, and the Reference Material sub-tabs) reuse the same generic `data-tab-target` script already in the template — never add Bootstrap's JS bundle just for tabs, and never build a second tab mechanism.

Light/dark theming defaults to the browser's `prefers-color-scheme`, with a manual toggle.

Your job per generation is only to author the question markup for each test section and the Reference Material content, following the exact data-attribute contract documented in the template's leading comment (`data-type="mcq|tf|fib"` + `data-answer=...` for Section A, `data-type="free"` + `data-model=...` for every other test section; optional `data-marks="N"` per question for formats that assign marks, e.g. mathematics). Wrap each test section in `<section class="card section-block" data-section="...">` so the dashboard's sections-completed count picks it up.

**Every question, in every section, also gets a solution-help info icon** (top-right of its card) that opens the page's shared modal — using the `{{SOLUTION_HELP_TRIGGER}}`/`{{SOLUTION_HELP_TEMPLATE}}` markup in the template's leading comment — available any time, independent of Submit, so a student stuck on a question can see how to get full marks rather than only finding out after grading. A modal has no size limit, so this holds more than the three-line minimum: **Answer**, **Justification**, **Approach**, and **two similar practice questions with their own short answers**. This is required for every question across every subject, not optional decoration.

The two similar questions must follow the same grounding discipline as everything else in this skill — pulled from the chapter's own worked examples/exercises (the same source material the graded question and Revision Notes draw from), never invented from general knowledge, and never a repeat of the graded question or of each other.

Keep individual questions visually plain: `data-marks` drives the dashboard's Marks Scored tile but is never rendered as a per-question badge (the section header's marks badge is the only visible marks indicator), and questions carry no per-question source citation — the page's one `{{SOURCE_NOTE}}` line already covers that for the whole page. (The plain-Markdown output mode above still cites every question individually; this simplification is specific to the interactive HTML page.)

Because scoring runs entirely client-side with no server, the correct answers necessarily live in the page's source — that's expected for this offline, self-contained format, not something to work around. If, after submitting, the student asks in chat to have their free-response answers evaluated by the tutor (rather than just self-compared), evaluate them following ground rules 1 and 2 above (textbook-only, simple language).

Save as:

```
output/reports/<Subject>-<Class>-<DD-MM>-test.html
```

Same naming convention and collision rule as the Markdown output above (each format's collision counter is independent — e.g. regenerating the same subject/class/day only for HTML still lands on `-test.html`, not `-2-test.html`, if no other `-test.html` exists yet for that day).

After saving, tell the user both ways to open the HTML file: **direct open** — it's already a complete, self-contained page at `output/reports/<Subject>-<Class>-<DD-MM>-test.html`, so they can copy/move it anywhere and open it straight in a browser (double-click, or `start "<path>"` on Windows / `open "<path>"` on macOS), no server needed, works fully offline; or **local server** — `npm run serve -- "<path-to-the-file>"` from the project root, useful for viewing from another device on the same network or if `file://` restrictions get in the way. Only actually start the server if asked to run it now.

## Insufficient content

If no reference documents have been uploaded for the requested class/subject/chapter, or what's there isn't enough to produce the full question counts above, say so clearly and ask the user to upload the relevant textbook section — do not invent content to fill the gap. If only some chapters/topics are missing, generate what you can from what's available and call out exactly what's missing.

## Hard rules

- Never include a question that isn't grounded in a file under `reference-documents/`.
- Never guess or backfill from memory when a requested chapter/topic is missing — report the gap; only stop entirely (without producing a test) if nothing at all in scope is available.
- If a subject in scope has no `.claude/skills/<subject>/SKILL.md`, treat it as unsupported and tell the user rather than answering from general knowledge.
