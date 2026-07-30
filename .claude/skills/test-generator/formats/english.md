# English test format

Used by `test-generator` whenever the subject is english, in place of the generic Section A/B format in `test-generator/SKILL.md`. Every other rule in `test-generator/SKILL.md` still applies unchanged — grounding, scope determination, insufficient-content handling, hard rules, and the summary/revision-notes/Key-Terms requirements. This file only replaces the section structure and adds English-specific presentation rules.

## Paper pattern (default: 40 marks)

**Section A — Reading Skills (10 marks)**
One comprehension passage plus 8 questions: 6 objective (MCQ / true-false / fill-in-the-blank / one-word-answer, 1 mark each = 6 marks) and 2 short subjective ("explain in your own words" / inference / value-based, 2 marks each = 4 marks). The passage must be an excerpt actually present in the chapter's `reference-documents` content — never an invented "unseen" passage, even though real school papers sometimes use one; this skill's grounding hard-rule always wins over that convention. If the chapter includes an illustration tied to the passage (a story image, a diagram referenced in the text), embed the real extracted image via `test-generator/SKILL.md`'s "Image-based questions" workflow rather than describing it.

**Section B — Grammar (5 marks)**
5 questions × 1 mark, drawn only from grammar topics the user explicitly named. If the user didn't name any, ground Section B in whichever grammar topics the chapter's own reference material actually covers (from: nouns, pronouns, adjectives, verbs, modal verbs, tenses, articles, prepositions, conjunctions, active/passive voice, direct/indirect speech, punctuation, sentence reordering) rather than picking arbitrarily. Mix question types: identify, choose the correct option, fill in the blank, change as directed, rewrite/correct the sentence, match the following.

**Section C — Writing Skills (5 marks)**
1 task × 5 marks. Pick a format appropriate to the chapter/context (informal or formal letter, notice, diary entry, story, paragraph, article, or message writing). State the word limit, marks, context, and intended audience where applicable.

**Section D — Literature (20 marks)**
Grounded strictly in the chapter's own text — never change character names, story events, poem meanings, or chapter sequence, and never invent textbook facts.
- Short Answer: set 5 questions (40-60 words each), student answers any 4 × 2 marks = 8 marks.
- Long Answer: set 3 questions (80-120 words each), student answers any 2 × 6 marks = 12 marks.
Include a mix of character-based, theme-based, moral/value-based, application-based, HOTS, and reasoning questions.

If the user asks for a different total, scale each section's marks proportionally (the source convention for this format is e.g. 50 marks → A:10, B:10, C:8, D:22) rather than dropping a section.

## Difficulty distribution

Balanced easy / moderate / slightly challenging, matching CBSE Class 7 standards. Avoid out-of-syllabus or extremely difficult questions.

## Language

Simple, age-appropriate English; clear instructions; proper grammar; school-examination phrasing throughout — for the question paper itself as much as for model answers.

## Answer key

Generate only when requested: complete answer key, marking scheme, and model/sample answers (for Literature and Writing, a model answer rather than a single "correct" string). Never reveal answers inside the question paper itself.

## Output order

School-style heading (subject, class, chapter/unit, time, maximum marks) → Section A → Section B → Section C → Section D → complete answer key (only if requested) → end of paper. The full answer key goes after the complete paper — never inline after each question.

## Formatting

Clear "SECTION A/B/C/D" headings, numbered questions, marks shown beside each question, professional school-exam layout — the paper should read like an actual Class 7 exam, not an AI worksheet.

## Interactive HTML mode

Follow `test-generator/SKILL.md`'s HTML output rules with this section structure instead of the generic one:
- Section A is mixed, not uniformly objective — mark each question's own `data-type` individually (`mcq`/`tf`/`fib` for the 6 objective items, `free` for the 2 short subjective items) rather than treating the whole section as one type; the grading engine scores by each question's `data-type`, not by which section it's wrapped in.
- Section B's identify/choose/fill-in-the-blank items are `mcq`/`fib` (auto-scored); its "change as directed"/"rewrite"/"correct the sentence" items are `free` (self-compare) — free-text rewrites don't reliably auto-grade by exact string match.
- Section C (writing) and Section D (literature) are always `free`.
- For Section D's "answer any N of M" sets, present only the required N questions in the interactive HTML page (not the full offered set) — the template's "sections completed" tracker expects every question rendered in a section to be answered, so rendering all M would never register as complete even after a valid attempt. The plain-Markdown paper keeps the traditional "Answer any N of M" choice format; only the HTML rendering narrows it to N.
