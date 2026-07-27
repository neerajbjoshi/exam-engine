# reference-documents

Source material the agent is grounded in. Nothing outside this tree is used to write or grade exam content.

## Layout

```
reference-documents/<class>/<subject>/<chapter>/
```

- `<class>` — e.g. `grade-10`, `grade-11-honors`
- `<subject>` — must be one of: `mathematics`, `science`, `social-studies`, `english`, `hindi`, `kannada`, `physics`, `chemistry`, `biology` (these match the per-subject skills in `.claude/skills/`, which only look inside their own subject folder)
- `<chapter>` — one folder per chapter/unit, e.g. `chapter-01-algebra`

Put the chapter's source files (PDF, EPUB-as-text, `.txt`, `.md`) directly inside the chapter folder — multiple files per chapter are fine (e.g. a textbook excerpt plus supplementary notes).

An example skeleton lives at `grade-10/mathematics/chapter-01-algebra/` — rename or delete it and add real class/subject/chapter folders following the same pattern.
