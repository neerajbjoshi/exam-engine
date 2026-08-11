import { createInterface, type Interface } from "node:readline/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog, humanize, type CatalogClass } from "./catalog.js";
import { getExamEngineResponse } from "./agent.js";
import { loadLastSessionId, saveLastSessionId } from "./session.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const referenceDocsRoot = join(__dirname, "..", "reference-documents");

interface Intent {
  label: string;
  needsFollowUp: boolean;
  build: (cls: CatalogClass, subject: string, followUp?: string) => string;
}

const INTENTS: Intent[] = [
  {
    label: "Ask a question",
    needsFollowUp: true,
    build: (cls, subject, followUp) => `For ${humanize(cls.name)}, ${humanize(subject)}: ${followUp ?? ""}`,
  },
  {
    label: "Generate a test",
    needsFollowUp: false,
    build: (cls, subject) => `Generate a test for ${humanize(cls.name)} ${humanize(subject)} covering all chapters.`,
  },
  {
    label: "Generate an interactive HTML test",
    needsFollowUp: false,
    build: (cls, subject) =>
      `Generate an interactive HTML test for ${humanize(cls.name)} ${humanize(subject)} covering all chapters.`,
  },
  {
    label: "Exam prep / revision help",
    needsFollowUp: false,
    build: (cls, subject) =>
      `Help me prepare for my ${humanize(subject)} exam for ${humanize(cls.name)} — give me a summary and revision notes.`,
  },
];

type LineReader = (promptText: string) => Promise<string>;

// `rl.question()` only resolves reliably once per process when stdin is a
// non-TTY pipe (all piped input arrives as a single buffered chunk, so a
// second `.question()` call hangs forever). Reading via the interface's own
// async iterator instead works correctly for both piped and real-TTY input.
function makeLineReader(rl: Interface): LineReader {
  const lines = rl[Symbol.asyncIterator]();
  return async (promptText: string) => {
    process.stdout.write(promptText);
    const { value, done } = await lines.next();
    if (done || value === undefined) {
      throw new Error("No more input");
    }
    return value.trim();
  };
}

async function pickFromMenu(nextLine: LineReader, title: string, options: string[]): Promise<number> {
  console.log(`\n${title}`);
  options.forEach((opt, i) => console.log(`  ${i + 1}) ${opt}`));
  while (true) {
    const answer = await nextLine("> ");
    const index = Number(answer) - 1;
    if (Number.isInteger(index) && index >= 0 && index < options.length) {
      return index;
    }
    console.log(`Please enter a number between 1 and ${options.length}.`);
  }
}

export async function runStartEngineFlow(): Promise<void> {
  const catalog = await buildCatalog(referenceDocsRoot);

  if (catalog.length === 0) {
    console.log(
      "I couldn't find any uploaded material yet under reference-documents/. Add a class/subject/chapter folder there, then run this again.",
    );
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const nextLine = makeLineReader(rl);
  try {
    const classIndex = await pickFromMenu(
      nextLine,
      "Which class?",
      catalog.map((c) => humanize(c.name)),
    );
    const cls = catalog[classIndex]!;

    const subjectIndex = await pickFromMenu(
      nextLine,
      `${humanize(cls.name)} — which subject?`,
      cls.subjects.map(humanize),
    );
    const subject = cls.subjects[subjectIndex]!;

    const intentIndex = await pickFromMenu(
      nextLine,
      `${humanize(cls.name)} ${humanize(subject)} — what would you like to do?`,
      INTENTS.map((i) => i.label),
    );
    const intent = INTENTS[intentIndex]!;

    let followUp: string | undefined;
    if (intent.needsFollowUp) {
      followUp = await nextLine("\nType your question: ");
    }

    const prompt = intent.build(cls, subject, followUp);
    console.log(`\nPrompt:\n  ${prompt}\n`);

    const send = (
      await nextLine("This calls the exam-engine agent and uses API credits. Send now? [y/N] ")
    ).toLowerCase();

    if (send === "y" || send === "yes") {
      console.log("\nThinking…\n");
      const resumeSessionId = await loadLastSessionId();
      const { text, sessionId } = await getExamEngineResponse(prompt, resumeSessionId);
      console.log(text);
      if (sessionId) {
        await saveLastSessionId(sessionId);
      }
    } else {
      console.log(`\nNot sent. Run it later with:\n  npm run dev -- "${prompt.replace(/"/g, '\\"')}"\n`);
    }
  } finally {
    rl.close();
  }
}
