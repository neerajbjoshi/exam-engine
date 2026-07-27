import { query } from "@anthropic-ai/claude-agent-sdk";
import { config } from "./config.js";
import { examTools } from "./tools/index.js";

export async function getExamEngineResponse(prompt: string): Promise<string> {
  const result = query({
    prompt,
    options: {
      model: config.model,
      systemPrompt: config.systemPrompt,
      cwd: process.cwd(),
      allowedTools: ["Read", "Glob", "Grep", "Write", "mcp__exam-engine-tools"],
      mcpServers: {
        "exam-engine-tools": examTools,
      },
    },
  });

  let text = "";
  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          text += block.text;
        }
      }
    }
  }
  return text;
}
