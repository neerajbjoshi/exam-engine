# output/reports

Generated tests/exams from the `test-generator` skill and `exam-generator` agent. Files are named:

```
<Subject>-<Class>-<DD-MM>-test.md          # question paper (Markdown mode)
<Subject>-<Class>-<DD-MM>-answer-key.md    # answer key (Markdown mode)
<Subject>-<Class>-<DD-MM>-test.html        # interactive, self-scoring page (HTML mode)
```

- `<Subject>` — Title Case, e.g. `Mathematics`, `SocialStudies`
- `<Class>` — no separators, e.g. `Grade10`
- `<DD-MM>` — day and month, zero-padded, dash-separated, e.g. `27-07`

Example: `Mathematics-Grade10-27-07-test.html`

If a file with that exact name already exists (regenerated same subject/class/day), a numeric suffix is appended before the extension (`-2`, `-3`, ...) rather than overwriting.

Not committed to git — only this README is tracked.
