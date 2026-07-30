# output/Unit Tests

Generated tests/exams from the `test-generator` skill and `exam-generator` agent, organized by grade then subject:

```
output/Unit Tests/<GradeFolder>/<SubjectFolder>/<Subject>-<Class>-<DD-MM>-test.md
output/Unit Tests/<GradeFolder>/<SubjectFolder>/<Subject>-<Class>-<DD-MM>-answer-key.md
output/Unit Tests/<GradeFolder>/<SubjectFolder>/<Subject>-<Class>-<DD-MM>-test.html
```

- `<GradeFolder>` — `Grade-7` through `Grade-12`.
- `<SubjectFolder>` — `Mathematics`, `Science`, `English`, `Social Studies`, or `Hindi`. A subject outside this list (e.g. Physics, Chemistry, Biology, Kannada) gets its own Title Case folder created on demand under the relevant grade — the six grade folders don't need to pre-exist for that to work.
- `<Subject>` (in the filename) — Title Case, no spaces, e.g. `Mathematics`, `SocialStudies`.
- `<Class>` — no separators, e.g. `Grade10`.
- `<DD-MM>` — day and month, zero-padded, dash-separated, e.g. `27-07`.

Example: `output/Unit Tests/Grade-10/Mathematics/Mathematics-Grade10-27-07-test.html`

If a file with that exact name already exists (regenerated same subject/class/day), a numeric suffix is appended before the extension (`-2`, `-3`, ...) rather than overwriting.

Not committed to git — only this README is tracked, so the Grade/Subject folders themselves don't survive a fresh clone (git doesn't track empty directories); they're recreated on demand the first time a test is generated for that grade/subject. See `.claude/skills/test-generator/SKILL.md`'s "Save location" section for the authoritative rule.
