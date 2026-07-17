import {
  Action,
  ActionPanel,
  Alert,
  Clipboard,
  Color,
  Icon,
  List,
  Toast,
  confirmAlert,
  showToast,
} from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { classifyError, errorCategoryLabel, humanizeError, rewriteText } from "./gemini";
import {
  beginRetry,
  clearHistory,
  deleteHistoryEntry,
  getHistory,
  historyPolicy,
  markHistoryError,
  markHistorySuccess,
} from "./history";
import { profiles } from "./prompts";
import type { HistoryEntry } from "./types";

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function statusText(entry: HistoryEntry): string {
  if (entry.status === "success") return "翻译成功";
  if (entry.status === "pending") return "处理中，或上次处理中断";
  return entry.errorCategory ? `翻译失败 · ${errorCategoryLabel(entry.errorCategory)}` : "翻译失败";
}

function statusIcon(entry: HistoryEntry): { source: Icon; tintColor: Color } {
  if (entry.status === "success") return { source: Icon.CheckCircle, tintColor: Color.Green };
  if (entry.status === "pending") return { source: Icon.Clock, tintColor: Color.Yellow };
  return { source: Icon.ExclamationMark, tintColor: Color.Red };
}

function escapeMarkdown(text: string): string {
  const specialCharacters = new Set([
    "\\",
    "`",
    "*",
    "_",
    "{",
    "}",
    "[",
    "]",
    "<",
    ">",
    "#",
    "+",
    "-",
    ".",
    "!",
    "|",
  ]);
  return Array.from(text, (character) =>
    specialCharacters.has(character) ? `\\${character}` : character,
  ).join("");
}

function detailMarkdown(entry: HistoryEntry): string {
  const sections = [`## 中文原文\n\n${escapeMarkdown(entry.sourceText)}`];

  if (entry.outputText) {
    sections.push(
      `## ${entry.status === "success" ? "英文结果" : "上次成功的英文结果"}\n\n${escapeMarkdown(entry.outputText)}`,
    );
  }

  if (entry.errorMessage) {
    sections.push(`## 最近错误\n\n${escapeMarkdown(entry.errorMessage)}`);
  }

  return sections.join("\n\n---\n\n");
}

export default function Command() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string>();

  async function reload() {
    setEntries(await getHistory());
  }

  useEffect(() => {
    reload()
      .catch((error) => {
        console.error(error);
        showToast({ style: Toast.Style.Failure, title: "无法读取本地历史" });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const subtitle = useMemo(
    () => `本机保存 · 最多 ${historyPolicy.maxEntries} 条 · ${historyPolicy.retentionDays} 天自动清理`,
    [],
  );

  async function copyText(text: string, title: string) {
    await Clipboard.copy(text);
    await showToast({ style: Toast.Style.Success, title });
  }

  async function retry(entry: HistoryEntry) {
    setBusyId(entry.id);
    const toast = await showToast({ style: Toast.Style.Animated, title: "正在重新翻译…" });

    try {
      const pending = await beginRetry(entry);
      setEntries((current) => [pending, ...current.filter((item) => item.id !== entry.id)]);

      const output = await rewriteText(entry.sourceText, entry.mode);
      await markHistorySuccess(entry.id, output);
      await Clipboard.copy(output);
      await reload();

      toast.style = Toast.Style.Success;
      toast.title = "重新翻译成功，英文已复制";
    } catch (error) {
      console.error(error);
      const message = humanizeError(error);

      try {
        await markHistoryError(entry.id, classifyError(error), message);
      } catch (historyError) {
        console.error("Failed to update retry error", historyError);
      }

      await Clipboard.copy(entry.sourceText);
      await reload();

      toast.style = Toast.Style.Failure;
      toast.title = "重新翻译失败，原中文已复制";
      toast.message = message;
    } finally {
      setBusyId(undefined);
    }
  }

  async function remove(entry: HistoryEntry) {
    const confirmed = await confirmAlert({
      title: "删除这条记录？",
      message: "中文原文和英文结果都会从本机历史中删除。",
      primaryAction: { title: "删除", style: Alert.ActionStyle.Destructive },
    });
    if (!confirmed) return;

    await deleteHistoryEntry(entry.id);
    await reload();
  }

  async function removeAll() {
    const confirmed = await confirmAlert({
      title: "清空全部 TweetCraft 历史？",
      message: "此操作无法撤销。Gemini API Key 不受影响。",
      primaryAction: { title: "清空全部", style: Alert.ActionStyle.Destructive },
    });
    if (!confirmed) return;

    await clearHistory();
    setEntries([]);
    await showToast({ style: Toast.Style.Success, title: "历史已清空" });
  }

  return (
    <List isLoading={isLoading} isShowingDetail searchBarPlaceholder="搜索中文原文或英文结果…">
      <List.EmptyView
        icon={Icon.Document}
        title="还没有本地草稿"
        description={`使用 tp、tpx、tps 或 tpr 后，记录会保存在这里。${subtitle}`}
      />

      {entries.map((entry) => {
        const isBusy = busyId === entry.id;
        const profile = profiles[entry.mode];

        return (
          <List.Item
            key={entry.id}
            icon={statusIcon(entry)}
            title={entry.sourceText.replace(/\s+/g, " ").trim()}
            subtitle={`${profile.label} · ${statusText(entry)}`}
            keywords={[entry.outputText ?? "", entry.errorMessage ?? "", profile.label]}
            accessories={[{ text: `${entry.attempts} 次` }, { text: formatTime(entry.updatedAt) }]}
            detail={<List.Item.Detail markdown={detailMarkdown(entry)} />}
            actions={
              <ActionPanel>
                {entry.status === "success" && entry.outputText ? (
                  <Action
                    title="复制英文"
                    icon={Icon.CopyClipboard}
                    onAction={() => copyText(entry.outputText!, "英文已复制")}
                  />
                ) : (
                  <Action
                    title={isBusy ? "正在重新翻译…" : "重新翻译"}
                    icon={Icon.ArrowClockwise}
                    onAction={() => retry(entry)}
                  />
                )}

                <Action
                  title="复制中文原文"
                  icon={Icon.Clipboard}
                  onAction={() => copyText(entry.sourceText, "中文原文已复制")}
                />

                {entry.status === "success" && (
                  <Action
                    title={isBusy ? "正在重新翻译…" : "重新翻译并覆盖英文结果"}
                    icon={Icon.ArrowClockwise}
                    onAction={() => retry(entry)}
                  />
                )}

                {entry.outputText && entry.status !== "success" && (
                  <Action
                    title="复制上次成功的英文"
                    icon={Icon.CopyClipboard}
                    onAction={() => copyText(entry.outputText!, "上次成功的英文已复制")}
                  />
                )}

                <ActionPanel.Section>
                  <Action
                    title="删除这条记录"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => remove(entry)}
                  />
                  <Action
                    title="清空全部历史"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={removeAll}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
