import { query } from "@anthropic-ai/claude-agent-sdk";
import { config } from "./config.js";
import { examTools } from "./tools/index.js";

export interface ExamEngineResult {
  text: string;
  sessionId: string;
}

export async function getExamEngineResponse(
  prompt: string,
  resumeSessionId?: string,
): Promise<ExamEngineResult> {
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
      ...(resumeSessionId ? { resume: resumeSessionId } : {}),
    },
  });

  let text = "";
  let sessionId = "";
  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          text += block.text;
        }
      }
    }
    if ("session_id" in message && message.session_id) {
      sessionId = message.session_id;
    }
  }
  return { text, sessionId };
}
