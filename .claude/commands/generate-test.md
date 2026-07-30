---
name: generate-test
description: Generate a chapter-wise test (Markdown + interactive HTML) for a given class, subject, and chapter via the test-generator skill.
argument-hint: [class] [subject] [chapter]
arguments: class subject chapter
disable-model-invocation: true
---

Generate a test using the **test-generator** skill (`.claude/skills/test-generator/SKILL.md`) for:

- Class: $class
- Subject: $subject
- Chapter: $chapter (if left empty, cover all chapters available for that subject)

Follow the test-generator skill's rules exactly:

- Ground every question strictly in `reference-documents/$class/$subject/` (the `$chapter` subfolder if one was given and exists — some subjects store files directly under the subject folder with no chapter subfolders).
- Produce **both** the Markdown pair and the interactive HTML page by default, saved under `output/Unit Tests/<GradeFolder>/<SubjectFolder>/` (per `test-generator/SKILL.md`'s save-location convention).
- Use the mathematics-specific format from `.claude/skills/test-generator/formats/mathematics.md` if `$subject` is mathematics; the generic Section A/B format otherwise.

If `reference-documents/$class/$subject/` doesn't exist, don't guess or substitute — say so and list which classes/subjects actually exist under `reference-documents/` instead.

When done, report the saved file paths and both ways to open the HTML file (direct open, or `npm run serve -- "<path>"`).
