# exam-engine

An exam-generation/grading agent built on the Claude Agent SDK (TypeScript).

## Structure

- `reference-documents/<class>/<subject>/<chapter>/` — source material (textbooks, notes, syllabi), organized by class, then subject, then chapter. The agent is instructed to ground all exam content strictly in these files and to say so when a class/subject/chapter isn't covered here, rather than use general knowledge. Actual documents aren't committed to git (see `.gitignore`) — only `README.md` files are tracked, so the folder convention survives a fresh clone.
- `src/index.ts` — CLI entry point (one-shot: `npm run dev -- "<prompt>"`)
- `src/agent.ts` — wraps the SDK `query()` call with this project's model/tools/system prompt; exports `getExamEngineResponse(prompt)` used by both the CLI and the web chat server
- `src/web-server.ts` — small dependency-free HTTP server (`node:http`) serving `public/chat.html` and a `POST /api/chat` endpoint that calls `getExamEngineResponse`
- `public/chat.html` — self-contained web chat UI with an animated teacher character (inline SVG + CSS keyframes). Greetings ("hi"/"hello"/etc.) are detected client-side and answered instantly with a wave animation and a canned welcome, without hitting the backend; everything else is sent to `/api/chat`
- `src/config.ts` — model and system prompt config (including the books/-grounding instruction)
- `src/tools/index.ts` — custom SDK MCP tools (e.g. grading)
- `.claude/agents/user-request-processor.md` — entry-point subagent for exam-engine requests. Classifies each request (subject Q&A, generate-test, exam-prep, or unsupported) and applies the matching skill's rules exactly, rather than answering from its own judgment.
- `.claude/agents/exam-generator.md` — always produces the test-generator skill's interactive-HTML output (self-scoring, self-contained) and tells the user how to open it: directly as a file, or via `npm run serve`.
- `.claude/agents/exam-writer.md` — Claude Code subagent for drafting exam content in this repo
- `.claude/skills/<subject>/SKILL.md` — one skill per subject (mathematics, science, social-studies, english, hindi, kannada, physics, chemistry, biology). Each triggers on questions/exam requests for its subject and answers strictly from `reference-documents/<class>/<subject>/` — it refuses to use outside knowledge and says so when the topic isn't covered.
- `.claude/skills/test-generator/SKILL.md` — triggers on "generate a test/exam/quiz" requests. Assembles a question paper plus a separate answer key from the relevant subject skill(s)/reference documents, and saves both under `output/reports/`.
- `output/reports/` — output of the test-generator skill and exam-generator agent (question papers, answer keys, interactive HTML pages), named `<Subject>-<Class>-<DD-MM>-*`. Not committed to git.
- `.claude/settings.json` — Claude Code permissions for this project

## Dev

```
npm install
npm run dev -- "your prompt"
```

For the chat UI with the animated teacher:

```
npm run web
```

then open http://localhost:5175 (say "hi" to see the greeting animation).

To view a generated interactive HTML exam over localhost instead of opening the file directly:

```
npm run serve -- "output/reports/<Subject>-<Class>-<DD-MM>-test.html"
```

Requires `ANTHROPIC_API_KEY` (see `.env.example`) or an `ant auth login` profile.
