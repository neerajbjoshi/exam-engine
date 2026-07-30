# Science test format

Used by `test-generator` whenever the subject is science, in place of the generic Section A/B format in `test-generator/SKILL.md`. Every other rule in `test-generator/SKILL.md` still applies unchanged — grounding, scope determination, insufficient-content handling, hard rules, and the summary/revision-notes/Key-Terms requirements. This file only replaces the section structure and adds science-specific presentation rules.

## Paper pattern (default: 40 marks)

**Section A — Multiple Choice Questions (8 marks)**
8 questions × 1 mark. Include application-based, diagram-based, and observation-based questions wherever the chapter supports them. For a diagram-based question, follow `test-generator/SKILL.md`'s "Image-based questions" workflow and embed the real figure extracted from the source PDF; only fall back to describing/referencing the diagram in words if extraction isn't available or no suitable figure exists.

**Section B — Assertion & Reason (3 marks)**
3 questions × 1 mark. Standard format:
```
Assertion (A): ...
Reason (R): ...

a) Both A and R are true and R is the correct explanation of A.
b) Both A and R are true but R is not the correct explanation of A.
c) A is true but R is false.
d) A is false but R is true.
```

**Section C — Very Short Answer (8 marks)**
4 questions × 2 marks. Definitions, examples, formula questions, identification, "why" questions.

**Section D — Short Answer (12 marks)**
3 questions × 4 marks. Practical situations, scientific reasoning, diagram interpretation, step-by-step explanations.

**Section E — Long Answer (5 marks)**
1 question × 5 marks. Include multiple sub-parts wherever appropriate.

**Section F — Case Study (4 marks)**
1 question × 4 marks. A real-life scenario grounded in the chapter, testing scientific reasoning, observation, and application; embed a real diagram from the source material (via the image workflow) wherever one exists and is relevant, otherwise reference it in words.

If the user asks for a different total, scale each section's question count and marks proportionally rather than dropping a section.

## Difficulty distribution

Approximately 30% easy / 50% medium / 20% application/HOTS, unless the user specifies otherwise.

## Question style

Prefer application-based MCQs, Assertion & Reason, case studies, practical/scientific-reasoning questions, observation-based questions, and diagram interpretation over direct textbook recall. Avoid a paper made up only of recall questions.

## Solution rules

Answer key includes, per question: the correct MCQ/Assertion-Reason option, and for subjective questions (Sections C-F) a model answer — use textbook terminology, prefer point-wise format, and highlight important keywords. Where a formula or step-by-step method applies, show working the same way the generic Solution rules in `test-generator/SKILL.md` require (formula → working → intermediate steps → final answer).

## Output order

Chapter number → chapter name → total marks → time → Section A → Section B → Section C → Section D → Section E → Section F → complete answer key → end of paper. The full answer key goes after the complete paper — never inline after each question.

## Formatting

Clear headings, numbered questions, marks shown beside each question, tables for formula/comparison content, consistent scientific terminology matching the source textbook throughout.

In interactive-HTML mode, follow `test-generator/SKILL.md`'s HTML output rules with this section structure instead of the generic one. Section B's Assertion-Reason questions are objective (a single correct option among a/b/c/d), so mark them `data-type="mcq"` just like Section A — the grading engine auto-scores every `data-type="mcq"/"tf"/"fib"` question on the page regardless of which section it's in, so both Section A and Section B get auto-scored together. Sections C-F stay `data-type="free"` (self-compare against the model answer).
