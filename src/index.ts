import { getExamEngineResponse } from "./agent.js";
import { runStartEngineFlow } from "./onboarding.js";
import { clearLastSessionId, loadLastSessionId, saveLastSessionId } from "./session.js";

const args = process.argv.slice(2);
const startNew = args.includes("--new");
const prompt = args.filter((arg) => arg !== "--new").join(" ");

if (!prompt) {
  console.error(
    'Usage: npm run dev -- "<prompt>"  (or: npm run dev -- "start the engine")\n' +
      "Add --new to start a fresh conversation instead of continuing the last one.",
  );
  process.exit(1);
}

if (startNew) {
  await clearLastSessionId();
}

if (/start\s+the\s+engine/i.test(prompt)) {
  await runStartEngineFlow();
} else {
  const resumeSessionId = await loadLastSessionId();
  const { text, sessionId } = await getExamEngineResponse(prompt, resumeSessionId);
  console.log(text);
  if (sessionId) {
    await saveLastSessionId(sessionId);
  }
}
