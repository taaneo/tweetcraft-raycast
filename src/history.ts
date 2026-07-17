import { LocalStorage } from "@raycast/api";
import type { ErrorCategory, HistoryEntry, RewriteMode } from "./types";

const STORAGE_KEY = "tweetcraft.history.v1";
const MAX_ENTRIES = 50;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

function normalizeSourceText(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<HistoryEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.sourceText === "string" &&
    typeof entry.normalizedSourceText === "string" &&
    typeof entry.mode === "string" &&
    typeof entry.status === "string" &&
    typeof entry.createdAt === "number" &&
    typeof entry.updatedAt === "number" &&
    typeof entry.lastAttemptAt === "number" &&
    typeof entry.attempts === "number"
  );
}

function prune(entries: HistoryEntry[], now = Date.now()): HistoryEntry[] {
  return entries
    .filter((entry) => now - entry.updatedAt <= RETENTION_MS)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_ENTRIES);
}

async function readRawHistory(): Promise<HistoryEntry[]> {
  const value = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry);
  } catch {
    return [];
  }
}

async function writeHistory(entries: HistoryEntry[]): Promise<void> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(prune(entries)));
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const raw = await readRawHistory();
  const cleaned = prune(raw);

  if (cleaned.length !== raw.length) {
    await writeHistory(cleaned);
  }

  return cleaned;
}

export async function beginHistoryAttempt(sourceText: string, mode: RewriteMode): Promise<HistoryEntry> {
  const now = Date.now();
  const normalizedSourceText = normalizeSourceText(sourceText);
  const entries = prune(await readRawHistory(), now);

  const duplicate = entries.find(
    (entry) =>
      entry.mode === mode &&
      entry.normalizedSourceText === normalizedSourceText &&
      now - entry.lastAttemptAt <= DUPLICATE_WINDOW_MS,
  );

  let current: HistoryEntry;

  if (duplicate) {
    current = {
      ...duplicate,
      sourceText,
      status: "pending",
      errorCategory: undefined,
      errorMessage: undefined,
      attempts: duplicate.attempts + 1,
      updatedAt: now,
      lastAttemptAt: now,
    };
  } else {
    current = {
      id: crypto.randomUUID(),
      sourceText,
      normalizedSourceText,
      mode,
      status: "pending",
      attempts: 1,
      createdAt: now,
      updatedAt: now,
      lastAttemptAt: now,
    };
  }

  const next = [current, ...entries.filter((entry) => entry.id !== current.id)];
  await writeHistory(next);
  return current;
}

export async function markHistorySuccess(id: string, outputText: string): Promise<HistoryEntry | undefined> {
  const now = Date.now();
  const entries = await readRawHistory();
  let updated: HistoryEntry | undefined;

  const next = entries.map((entry) => {
    if (entry.id !== id) return entry;
    updated = {
      ...entry,
      status: "success",
      outputText,
      errorCategory: undefined,
      errorMessage: undefined,
      updatedAt: now,
    };
    return updated;
  });

  await writeHistory(next);
  return updated;
}

export async function markHistoryError(
  id: string,
  errorCategory: ErrorCategory,
  errorMessage: string,
): Promise<HistoryEntry | undefined> {
  const now = Date.now();
  const entries = await readRawHistory();
  let updated: HistoryEntry | undefined;

  const next = entries.map((entry) => {
    if (entry.id !== id) return entry;
    updated = {
      ...entry,
      status: "error",
      errorCategory,
      errorMessage,
      updatedAt: now,
    };
    return updated;
  });

  await writeHistory(next);
  return updated;
}

export async function beginRetry(entry: HistoryEntry): Promise<HistoryEntry> {
  const now = Date.now();
  const entries = await readRawHistory();
  const updated: HistoryEntry = {
    ...entry,
    status: "pending",
    errorCategory: undefined,
    errorMessage: undefined,
    attempts: entry.attempts + 1,
    updatedAt: now,
    lastAttemptAt: now,
  };

  await writeHistory([updated, ...entries.filter((item) => item.id !== entry.id)]);
  return updated;
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const entries = await readRawHistory();
  await writeHistory(entries.filter((entry) => entry.id !== id));
}

export async function clearHistory(): Promise<void> {
  await LocalStorage.removeItem(STORAGE_KEY);
}

export const historyPolicy = {
  maxEntries: MAX_ENTRIES,
  retentionDays: 30,
  duplicateWindowMinutes: 5,
} as const;
