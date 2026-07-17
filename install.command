#!/bin/bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js/npm 未安装。请先安装 Node.js LTS，然后重新运行。"
  read -r -p "按回车关闭…"
  exit 1
fi

echo "正在安装依赖…"
npm install

echo
echo "正在把 TweetCraft 加入 Raycast…"
echo "Raycast 出现扩展后，可回到此窗口按 Control-C。"
npm run dev
