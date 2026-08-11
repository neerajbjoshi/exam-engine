# exam-engine

An exam-generation/grading agent built on the Claude Agent SDK (TypeScript).

See [ARCHITECTURE.md](ARCHITECTURE.md) for a diagram of how the pieces below fit together — in particular, the Node app (`src/`) and the `.claude/` agents/skills are two independent paths that don't call each other.

## Structure

- `reference-documents/<class>/<subject>/<chapter>/` — source material (textbooks, notes, syllabi), organized by class, then subject, then chapter. The agent is instructed to ground all exam content strictly in these files and to say so when a class/subject/chapter isn't covered here, rather than use general knowledge. Actual documents aren't committed to git (see `.gitignore`) — only `README.md` files are tracked, so the folder convention survives a fresh clone.
- `src/index.ts` — CLI entry point (`npm run dev -- "<prompt>"`). If the prompt matches "start the engine" it runs the local onboarding flow instead of calling the agent.
- `src/onboarding.ts` — interactive terminal menu (class → subject → intent, via `node:readline/promises`) built from `src/catalog.ts`. Only calls the agent if you explicitly confirm "y" at the end; otherwise it just prints the composed prompt to run later. No API cost unless you say yes.
- `src/catalog.ts` — shared helper (`buildCatalog`, `humanize`) that scans `reference-documents/` for class/subject folders; used by both the CLI onboarding flow and `web-server.ts`'s `/api/catalog`.
- `src/agent.ts` — wraps the SDK `query()` call with this project's model/tools/system prompt; exports `getExamEngineResponse(prompt, resumeSessionId?)` used by both the CLI and the web chat server, returning `{ text, sessionId }`. Passing back the returned `sessionId` as `resumeSessionId` on the next call resumes the same SDK conversation (multi-turn continuity), rather than each call starting a fresh, context-less session.
- `src/session.ts` — persists the last CLI session id to a gitignored `.exam-engine-session.json` at the repo root so `npm run dev` auto-continues the previous conversation across separate invocations; pass `--new` to start fresh instead.
- `src/web-server.ts` — small dependency-free HTTP server (`node:http`) serving `public/chat.html`, `GET /api/catalog` (filesystem-only, no LLM call), and `POST /api/chat` which calls `getExamEngineResponse` with the `sessionId` the client sends back, returning the (possibly new) `sessionId` for the client to keep sending
- `public/chat.html` — self-contained web chat UI with an animated teacher character (inline SVG + CSS keyframes). Greetings ("hi"/"hello"/etc.) are detected client-side and answered instantly with a wave animation and a canned welcome; "start the engine" runs the same class/subject/intent button flow as the CLI and only pre-fills the input box. Neither hits the backend/agent — only sending the final message does. Keeps the SDK `sessionId` in a page-scoped JS variable so follow-up messages continue the same conversation; a page reload starts a new one.
- `src/config.ts` — model and system prompt config (including the books-grounding instruction and the file-based exam-grading workflow: read question paper + answer key + a student's answer file, grade question-by-question via the `grade_answer` tool, then write a graded report)
- `src/tools/index.ts` — custom SDK MCP tools. `grade_answer` records one question's score/feedback (computed by the agent itself against the answer key) per call, rejecting a score over `maxMarks`; the agent calls it once per question while grading an exam, then writes the aggregated report itself.
- `scripts/pdf-text.mjs` — standalone Node PDF text extractor, kept as a fallback for when `pdftoppm`/`pdftotext` (Poppler — see Dev below) aren't installed, so the Read tool's native PDF rendering isn't available. Inflates FlateDecode streams and walks each content stream's operators to pull out text, tracking font (`Tf`) and fill-color (`rg`/`g`/`k`) state per run to tag `**bold**` and `[RED]...[/RED]` spans inline — best-effort, not a full PDF parser (see the file's own header comment for its limits, e.g. some PDFs' bold spans turn out to be an overlaid answer-key layer rather than genuine textbook emphasis). Used by test-generator's interactive-HTML mode to ground the "Most Important Topics" tab in whatever the source PDF itself visually emphasizes. Run as `node scripts/pdf-text.mjs <path-to-pdf>`.
- `.claude/agents/user-request-processor.md` — entry-point subagent for exam-engine requests. Recognizes "start the engine" and runs a guided class → subject → intent menu (one question per turn, mirroring `src/onboarding.ts`'s CLI flow); otherwise classifies the request (subject Q&A, generate-test, exam-prep, or unsupported) and applies the matching skill's rules exactly, rather than answering from its own judgment.
- `.claude/agents/exam-generator.md` — produces only the test-generator skill's interactive-HTML output (skipping the Markdown pair) and tells the user how to open it: directly as a file, or via `npm run serve`. Use when the user wants just the HTML, not the default Markdown+HTML pair.
- `.claude/agents/exam-writer.md` — Claude Code subagent for drafting exam content in this repo
- `.claude/skills/<subject>/SKILL.md` — one skill per subject (mathematics, science, social-studies, english, hindi, kannada, physics, chemistry, biology). Each triggers on questions/exam requests for its subject and answers strictly from `reference-documents/<class>/<subject>/` — it refuses to use outside knowledge and says so when the topic isn't covered.
- `.claude/skills/test-generator/SKILL.md` — triggers on "generate a test/exam/quiz" requests. By default produces **both** a Markdown question paper + answer key and a self-contained interactive HTML page from the relevant subject skill(s)/reference documents, all saved under `output/Unit Tests/<GradeFolder>/<SubjectFolder>/` (only a single format if the user explicitly asks for just one). Also defines the "Image-based questions" workflow (via `pdfimages`) for embedding a real diagram/map/figure extracted from the source PDF into a question — used across every subject, not just science/social-studies. Requires the `Bash` tool.
- `.claude/skills/test-generator/snippets/score-circle.html` — verified (browser-tested) HTML/CSS/JS for the circular Section-A-score badge; superseded as the primary interactive-HTML shell by `dashboard-template.html` below (which incorporates the same ring), kept as a standalone reference for the ring component itself.
- `.claude/skills/test-generator/snippets/dashboard-template.html` — the **one shared page template** every subject's interactive HTML test is built from: Bootstrap-styled dashboard (score ring, sections-completed, marks-scored, performance-band), generic client-side grading engine, and light/dark theming, all filled in via `{{PLACEHOLDER}}` tokens per generation. See its own leading comment for the fill-in contract.
- `.claude/skills/test-generator/snippets/bootstrap.min.css` — Bootstrap 5.3.8 CSS, vendored via `npm install bootstrap` (a devDependency in `package.json`) and copied verbatim from `node_modules/bootstrap/dist/css/bootstrap.min.css`. Inlined into `dashboard-template.html`'s `{{BOOTSTRAP_CSS}}` placeholder at generation time so pages stay CDN-free and fully offline. Re-copy this file after bumping the `bootstrap` devDependency.
- `.claude/skills/test-generator/formats/mathematics.md` — mathematics' own test section structure (CBSE-style, marks-weighted Section A-D), used by test-generator in place of its generic Section A/B default.
- `.claude/skills/test-generator/formats/science.md` — science's own test section structure (CBSE-style, marks-weighted Section A-F: MCQ, Assertion-Reason, Very Short/Short/Long Answer, Case Study), used by test-generator in place of its generic Section A/B default.
- `.claude/skills/test-generator/formats/social-studies.md` — social studies' own test section structure (CBSE-style, marks-weighted Section A-F: Objective, Very Short/Short/Long Answer, Case Study, Map-Based), used by test-generator in place of its generic Section A/B default.
- `.claude/skills/test-generator/formats/english.md` — English's own test section structure (CBSE-style Section A-D: Reading Skills, Grammar, Writing Skills, Literature), used by test-generator in place of its generic Section A/B default. Other subjects use the generic default; only mathematics, science, social studies, and English have override files.
- `output/Unit Tests/<GradeFolder>/<SubjectFolder>/` — output of the test-generator skill and exam-generator agent (question papers, answer keys, interactive HTML pages), organized by grade (`Grade-7` … `Grade-12`) then subject (`Mathematics`, `Science`, `English`, `Social Studies`, `Hindi`, or the Title Case of any other subject — folders are created on demand), files named `<Subject>-<Class>-<DD-MM>-*`. Not committed to git (see `output/Unit Tests/README.md`).
- `output/reports/` — legacy/misc location, now only holding source "system instructions" docs the format files under `test-generator/formats/` were distilled from (not generated test output — that moved to `output/Unit Tests/`). Not committed to git except `README.md`.
- `.claude/settings.json` — Claude Code permissions for this project

## Dev

```
npm install
npm run dev -- "your prompt"
```

Each `npm run dev` call auto-continues the previous CLI conversation (see `src/session.ts`); add `--new` to start a fresh one instead:

```
npm run dev -- --new "your prompt"
```

To get a guided menu (class → subject → what to do) instead of writing a prompt yourself — no API cost unless you confirm sending:

```
npm run dev -- "start the engine"
```

For the chat UI with the animated teacher:

```
npm run web
```

then open http://localhost:5175 (say "hi" to see the greeting animation).

To view a generated interactive HTML exam over localhost instead of opening the file directly:

```
npm run serve -- "output/Unit Tests/<GradeFolder>/<SubjectFolder>/<Subject>-<Class>-<DD-MM>-test.html"
```

Requires `ANTHROPIC_API_KEY` (see `.env.example`) or an `ant auth login` profile.

Recommended: install [Poppler](https://github.com/oschwartz10612/poppler-windows) (`pdftoppm`/`pdftotext`/`pdfimages`) — on Windows, `winget install --id oschwartz10612.Poppler -e --source winget`. Without it, PDF-grounded skills fall back to `scripts/pdf-text.mjs` for text (best-effort, not all PDFs extract cleanly) and can't do the "Image-based questions" workflow at all (no way to extract real diagrams/maps/figures). Restart the Claude Code session after installing so its tools pick up the updated PATH.
