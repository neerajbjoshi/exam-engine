import { readdir } from "node:fs/promises";
import { join } from "node:path";

export interface CatalogClass {
  name: string;
  subjects: string[];
}

export async function buildCatalog(referenceDocsRoot: string): Promise<CatalogClass[]> {
  const classes: CatalogClass[] = [];
  let classEntries;
  try {
    classEntries = await readdir(referenceDocsRoot, { withFileTypes: true });
  } catch {
    return classes;
  }

  for (const entry of classEntries) {
    if (!entry.isDirectory()) continue;
    let subjectEntries;
    try {
      subjectEntries = await readdir(join(referenceDocsRoot, entry.name), { withFileTypes: true });
    } catch {
      continue;
    }
    const subjects = subjectEntries.filter((e) => e.isDirectory()).map((e) => e.name);
    if (subjects.length > 0) {
      classes.push({ name: entry.name, subjects });
    }
  }

  return classes;
}

export function humanize(name: string): string {
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
