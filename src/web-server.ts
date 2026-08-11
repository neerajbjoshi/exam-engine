import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getExamEngineResponse } from "./agent.js";
import { buildCatalog } from "./catalog.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const chatHtmlPath = join(__dirname, "..", "public", "chat.html");
const referenceDocsRoot = join(__dirname, "..", "reference-documents");
const port = Number(process.argv[2] ?? 5175);
const RESPONSE_TIMEOUT_MS = 120_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    const html = await readFile(chatHtmlPath, "utf-8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
    return;
  }

  if (req.method === "GET" && req.url === "/api/catalog") {
    const classes = await buildCatalog(referenceDocsRoot);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ classes }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const { message, sessionId } = JSON.parse(body) as { message: string; sessionId?: string };
        const { text, sessionId: newSessionId } = await withTimeout(
          getExamEngineResponse(message, sessionId),
          RESPONSE_TIMEOUT_MS,
        );
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ reply: text, sessionId: newSessionId }));
      } catch (error) {
        const isTimeout = error instanceof Error && error.message === "timeout";
        res.writeHead(isTimeout ? 504 : 500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(
          JSON.stringify({
            error: isTimeout
              ? "The teacher took too long to respond. Please try again."
              : "Something went wrong. Please try again.",
          }),
        );
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(port, () => {
  console.log(`exam-engine chat running at http://localhost:${port}`);
});
