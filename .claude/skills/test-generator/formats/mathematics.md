# Mathematics test format

Used by `test-generator` whenever the subject is mathematics, in place of the generic Section A/B format in `test-generator/SKILL.md`. Every other rule in `test-generator/SKILL.md` still applies unchanged — grounding, scope determination, insufficient-content handling, hard rules, and the summary/revision-notes/Key-Terms requirements. This file only replaces the section structure and adds mathematics-specific presentation rules.

## Paper pattern (default: 40 marks)

**Section A — Objective (8 marks)**
8 questions × 1 mark. Balanced mix of MCQ, fill in the blanks, true/false, match the following (where applicable), and assertion-reason — only include assertion-reason if it naturally fits the chapter, don't force it.

**Section B — Short Answer (8 marks)**
4 questions × 2 marks. Basic understanding, direct textbook concepts, simple calculations, definitions, small applications.

**Section C — Descriptive (12 marks)**
4 questions × 3 marks. Step-by-step solutions, word problems, explanation questions, conceptual understanding, application of textbook ideas.

**Section D — Higher Order Thinking / Application (12 marks)**
4 questions × 3 marks. Logical reasoning, application of concepts, problem solving, pattern recognition, real-life applications drawn from the chapter.

If the user asks for a different total, scale each section's question count and marks proportionally rather than dropping a section.

## Difficulty distribution

Approximately 30% easy / 50% medium / 20% challenging, unless the user specifies otherwise.

## Assertion-Reason format

When a chapter suits it:

```
Assertion (A): ...
Reason (R): ...

a) Both A and R are true and R is the correct explanation of A.
b) Both A and R are true but R is not the correct explanation of A.
c) A is true but R is false.
d) A is false but R is true.
```

## Solution rules

Every numerical answer-key entry includes, in order: formula (if applicable) → working → intermediate steps → final answer. Never skip steps.

Word problems: expression → working → final answer.

## Output order

Chapter number → chapter name → total marks → time → Section A → Section B → Section C → Section D → complete answer key → end of paper. The full answer key goes after the complete paper — never inline after each question.

## Formatting

Clear headings, numbered questions, marks shown beside each question, proper mathematical notation, aligned working shown where relevant. In interactive-HTML mode, follow `test-generator/SKILL.md`'s HTML output rules (score circle, auto-scoring for Section A, self-compare for Sections B-D) with this section structure instead of the generic one.
