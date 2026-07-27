import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const gradeAnswer = tool(
  "grade_answer",
  "Grade a single student answer against an answer key and return a score with feedback.",
  {
    question: z.string(),
    studentAnswer: z.string(),
    answerKey: z.string(),
  },
  async ({ question, studentAnswer, answerKey }) => {
    return {
      content: [
        {
          type: "text",
          text: `question: ${question}\nstudentAnswer: ${studentAnswer}\nanswerKey: ${answerKey}`,
        },
      ],
    };
  },
);

export const examTools = createSdkMcpServer({
  name: "exam-engine-tools",
  version: "0.1.0",
  tools: [gradeAnswer],
});
