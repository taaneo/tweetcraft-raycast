import { showHUD } from "@raycast/api";
import { checkConnection, humanizeError } from "./gemini";

export default async function Command() {
  await showHUD("🧪 正在检查 Gemini 连接…");

  try {
    const result = await checkConnection();
    await showHUD(`✅ Gemini 正常｜${result.model}｜${result.route}`);
  } catch (error) {
    console.error(error);
    await showHUD(`❌ ${humanizeError(error)}`);
  }
}
