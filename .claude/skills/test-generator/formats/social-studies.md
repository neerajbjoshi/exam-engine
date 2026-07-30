# Social Studies test format

Used by `test-generator` whenever the subject is social-studies, in place of the generic Section A/B format in `test-generator/SKILL.md`. Every other rule in `test-generator/SKILL.md` still applies unchanged — grounding, scope determination, insufficient-content handling, hard rules, and the summary/revision-notes/Key-Terms requirements. This file only replaces the section structure and adds social-studies-specific presentation rules.

## Paper pattern (default: 40 marks)

The source instructions this format is based on didn't give an explicit mark scheme (only "follow the sample paper, or distribute proportionally if none is given") — the counts/marks below are the proportional default; scale them if the user asks for a different total.

**Section A — Objective (8 marks)**
8 questions × 1 mark. A mix of MCQ, fill in the blanks, true/false, match the following, and picture-based or map-based objective questions. For a picture/map item, follow `test-generator/SKILL.md`'s "Image-based questions" workflow and embed the real map/image extracted from the source PDF; only reference it in words if extraction isn't available or the chapter has no usable image — never invent one either way.

**Section B — Very Short Answer (4 marks)**
4 questions × 1 mark. Concise, factual, one-line answers.

**Section C — Short Answer (12 marks)**
4 questions × 3 marks. Explanation in 2-4 points each.

**Section D — Long Answer (10 marks)**
2 questions × 5 marks. Descriptive, textbook-based explanations testing understanding, comparison, description, importance, or causes and effects.

**Section E — Case Study / Source-Based (4 marks)**
1 question × 4 marks, with 2-3 sub-parts. A short passage plus related questions — only generate this section if the chapter's source material actually supports a case study/passage; otherwise state that and omit it rather than inventing one.

**Section F — Map-Based / Practical (2 marks)**
1 question (locate/label/identify: regions, physical features, rivers, mountains, plateaus, plains, deserts, climate regions, etc.), covering only locations/features that appear in the uploaded source material. Omit this section entirely if the chapter has no map content, rather than inventing locations.

## Question style

Balance knowledge, understanding, application, reasoning, and (where the chapter supports it) map-based questions. Match the style and difficulty of the sample paper if one was uploaded; otherwise follow the default 30% easy / 50% moderate / 20% application-reasoning-competency split.

## Solution rules

Answer key entries are strictly textbook-based, written in simple Class 7 language, matching what a school examiner would expect, with keywords highlighted. No invented facts, dates, or locations beyond the source material.

## Output order

Chapter number → chapter name → total marks → time → Section A → Section B → Section C → Section D → Section E → Section F → complete answer key → end of paper. The full answer key goes after the complete paper — never inline after each question.

## Formatting

Clear headings, numbered questions, marks shown beside each question, simple Class 7 English, textbook terminology preserved.

In interactive-HTML mode, follow `test-generator/SKILL.md`'s HTML output rules with this section structure instead of the generic one:
- Only Section A is auto-scored (`data-type="mcq"/"tf"/"fib"`) — Sections B-F are `data-type="free"` (self-compare against the model answer), matching the source instructions' explicit "Section B-F: do not automatically score."
- The shared template has no native "match the following" widget. Render each match-pair as its own `data-type="fib"` question (e.g. "Match X with its correct pair: ______") rather than inventing a new question type or touching the grading engine.
- Represent map/picture-based objective items the same way as any other Section A question (`mcq`/`fib`), with a real extracted map/image (`<img class="q-image">`) at the top of the card when one exists in the source. Only fall back to naming the location/feature in the question text (e.g. "Which mountain range is shown between X and Y in the chapter's map?") when extraction isn't available or the chapter has no usable map image — never fabricate an image asset either way.
