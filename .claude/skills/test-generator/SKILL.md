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

## Output — plain Markdown (default)

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

## Output — interactive HTML (only when explicitly requested)

If the request asks for an interactive/HTML/webpage version, generate a single self-contained `.html` file instead (or in addition, if asked for both) — no external CSS/JS/font/CDN dependencies, so it works fully offline once generated:

- Chapter and topic name displayed clearly at the top.
- A "Key Terms" section (or inline highlights) for important definitions/keywords, visually distinguished.
- Section A rendered as interactive inputs: text inputs for fill-in-the-blank, toggle/radio buttons for True/False, radio buttons for MCQ.
- Section B rendered as free-text boxes for the student's typed response.
- A "Submit Test" button.
- On submit:
  - Section A is auto-scored client-side against the correct answers embedded in the page; show the score (e.g. "24/30") and mark each answer right/wrong, revealing the correct answer next to any mistake.
  - Section B is NOT auto-scored. Instead, show the model/reference answer next to the student's own typed response, for self-comparison.
- Because scoring runs entirely client-side with no server, the correct answers necessarily live in the page's source — that's expected for this offline, self-contained format, not something to work around.
- If, after submitting, the student asks in chat to have their Section B answers evaluated by the tutor (rather than just self-compared), evaluate them following ground rules 1 and 2 above (textbook-only, simple language).

Save as:

```
output/reports/<Subject>-<Class>-<DD-MM>-test.html
```

Same naming convention and collision rule as the Markdown output above.

## Insufficient content

If no reference documents have been uploaded for the requested class/subject/chapter, or what's there isn't enough to produce the full question counts above, say so clearly and ask the user to upload the relevant textbook section — do not invent content to fill the gap. If only some chapters/topics are missing, generate what you can from what's available and call out exactly what's missing.

## Hard rules

- Never include a question that isn't grounded in a file under `reference-documents/`.
- Never guess or backfill from memory when a requested chapter/topic is missing — report the gap; only stop entirely (without producing a test) if nothing at all in scope is available.
- If a subject in scope has no `.claude/skills/<subject>/SKILL.md`, treat it as unsupported and tell the user rather than answering from general knowledge.
