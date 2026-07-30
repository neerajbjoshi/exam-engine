import { getExamEngineResponse } from "./agent.js";
import { runStartEngineFlow } from "./onboarding.js";

const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.error('Usage: npm run dev -- "<prompt>"  (or: npm run dev -- "start the engine")');
  process.exit(1);
}

if (/start\s+the\s+engine/i.test(prompt)) {
  await runStartEngineFlow();
} else {
  console.log(await getExamEngineResponse(prompt));
}
