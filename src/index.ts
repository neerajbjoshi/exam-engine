import { getExamEngineResponse } from "./agent.js";

const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.error("Usage: npm run dev -- \"<prompt>\"");
  process.exit(1);
}

console.log(await getExamEngineResponse(prompt));
