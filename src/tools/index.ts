import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const gradeAnswer = tool(
  "grade_answer",
  "Record the grade for one student answer. Compare the student's answer against the answer key yourself first, then call this once per question with the score you worked out — never more than once for the same question.",
  {
    question: z.string(),
    studentAnswer: z.string(),
    answerKey: z.string(),
    maxMarks: z.number().positive(),
    score: z.number().min(0),
    feedback: z.string(),
  },
  async ({ question, maxMarks, score, feedback }) => {
    if (score > maxMarks) {
      return {
        content: [
          {
            type: "text",
            text: `Rejected: score ${score} exceeds maxMarks ${maxMarks} for "${question}". Re-check your grading and call grade_answer again with a valid score.`,
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text",
          text: `Recorded ${score}/${maxMarks} for "${question}": ${feedback}`,
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
