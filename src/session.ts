import { readFile, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sessionFile = join(__dirname, "..", ".exam-engine-session.json");

export async function loadLastSessionId(): Promise<string | undefined> {
  try {
    const raw = await readFile(sessionFile, "utf-8");
    return (JSON.parse(raw) as { sessionId?: string }).sessionId;
  } catch {
    return undefined;
  }
}

export async function saveLastSessionId(sessionId: string): Promise<void> {
  await writeFile(sessionFile, JSON.stringify({ sessionId }), "utf-8");
}

export async function clearLastSessionId(): Promise<void> {
  await rm(sessionFile, { force: true });
}
