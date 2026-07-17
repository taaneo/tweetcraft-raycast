import { Clipboard, LaunchProps, showHUD } from "@raycast/api";
import { classifyError, humanizeError, rewriteText } from "./gemini";
import { beginHistoryAttempt, markHistoryError, markHistorySuccess } from "./history";
import { profiles } from "./prompts";
import type { RewriteArguments, RewriteMode } from "./types";

export async function runRewrite(
  props: LaunchProps<{ arguments: RewriteArguments }>,
  mode: RewriteMode,
): Promise<void> {
  const input = props.arguments.text?.trim();
  if (!input) {
    await showHUD("❌ 请输入中文内容");
    return;
  }

  let historyEntry;
  try {
    // The source text is written locally before any network request begins.
    historyEntry = await beginHistoryAttempt(input, mode);
  } catch (error) {
    console.error("Failed to save local draft", error);
    await Clipboard.copy(input);
    await showHUD("❌ 无法保存本地草稿，原中文已复制；未发送翻译请求");
    return;
  }

  const profile = profiles[mode];
  await showHUD(`✨ 已保存草稿，正在生成 ${profile.label} 英文…`);

  try {
    const output = await rewriteText(input, mode);
    await markHistorySuccess(historyEntry.id, output);
    await Clipboard.copy(output);
    const count = Array.from(output).length;
    await showHUD(`✅ 已复制 ${profile.label} 英文（${count} 字符）`);
  } catch (error) {
    console.error(error);
    const message = humanizeError(error);

    try {
      await markHistoryError(historyEntry.id, classifyError(error), message);
    } catch (historyError) {
      console.error("Failed to update local draft error state", historyError);
    }

    await Clipboard.copy(input);
    await showHUD(`❌ 翻译失败，原中文已复制：${message}`);
  }
}
