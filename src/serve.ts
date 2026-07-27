import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { basename, dirname, extname, join, resolve, sep } from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const target = process.argv[2];
const port = Number(process.argv[3] ?? 4173);

if (!target) {
  console.error('Usage: npm run serve -- "<path-to-html-file-or-directory>" [port]');
  process.exit(1);
}

const resolvedTarget = resolve(target);
const targetStat = await stat(resolvedTarget);
const root = targetStat.isDirectory() ? resolvedTarget : dirname(resolvedTarget);
const indexFile = targetStat.isDirectory() ? "index.html" : basename(resolvedTarget);

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const requestedPath = urlPath === "/" ? indexFile : urlPath.replace(/^\/+/, "");
  const filePath = resolve(join(root, requestedPath));

  if (filePath !== root && !filePath.startsWith(root + sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, () => {
  const openPath = targetStat.isDirectory() ? "" : indexFile;
  console.log(`Serving ${root} at http://localhost:${port}/${openPath}`);
});
