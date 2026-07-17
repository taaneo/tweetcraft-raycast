#!/usr/bin/env bash
set -Eeuo pipefail

# 用法：
#   ./publish-tweetcraft-private.sh
#   ./publish-tweetcraft-private.sh "/完整路径/tweetcraft-raycast"
#
# 可选第二个参数用于修改 GitHub 仓库名：
#   ./publish-tweetcraft-private.sh "/完整路径/tweetcraft-raycast" "tweetcraft-raycast"

PROJECT_DIR="${1:-$(pwd)}"
REPO_NAME="${2:-tweetcraft-raycast}"
VERSION_TAG="v1.1.0"

die() {
  printf "❌ %s\n" "$*" >&2
  exit 1
}

command -v git >/dev/null 2>&1 || die "没有找到 git。"
command -v gh >/dev/null 2>&1 || die "没有找到 GitHub CLI（gh）。请先运行：brew install gh"

gh auth status >/dev/null 2>&1 || die "GitHub CLI 尚未登录。请先运行：gh auth login --web --git-protocol https"

cd "$PROJECT_DIR" || die "无法进入目录：$PROJECT_DIR"
test -f package.json || die "这里不是 TweetCraft 项目目录：$(pwd)"

printf "📁 项目目录：%s\n" "$(pwd)"
printf "🔒 GitHub 仓库：%s（private）\n" "$REPO_NAME"

# 合并必要的忽略规则，不覆盖已有 .gitignore。
touch .gitignore
for pattern in \
  "node_modules/" \
  "dist/" \
  ".raycast/" \
  ".env" \
  ".env.*" \
  "!.env.example" \
  ".DS_Store" \
  "*.log" \
  "npm-debug.log*" \
  "yarn-debug.log*" \
  "yarn-error.log*" \
  "pnpm-debug.log*"
do
  grep -Fxq "$pattern" .gitignore || printf "%s\n" "$pattern" >> .gitignore
done

GH_USER="$(gh api user --jq '.login')"
GH_ID="$(gh api user --jq '.id')"

git config user.name "$GH_USER"
git config user.email "${GH_ID}+${GH_USER}@users.noreply.github.com"

if [ ! -d .git ]; then
  git init -b main
fi

git branch -M main
git add .

if git diff --cached --quiet; then
  printf "ℹ️ 没有新的文件需要提交。\n"
else
  git commit -m "Initial release: TweetCraft v1.1.0"
fi

if git remote get-url origin >/dev/null 2>&1; then
  printf "ℹ️ 已存在 origin：%s\n" "$(git remote get-url origin)"
elif gh repo view "${GH_USER}/${REPO_NAME}" >/dev/null 2>&1; then
  git remote add origin "https://github.com/${GH_USER}/${REPO_NAME}.git"
  printf "ℹ️ 已连接到现有私有仓库：%s/%s\n" "$GH_USER" "$REPO_NAME"
else
  gh repo create "$REPO_NAME" \
    --private \
    --source=. \
    --remote=origin
fi

git push -u origin main

if ! git rev-parse "$VERSION_TAG" >/dev/null 2>&1; then
  git tag -a "$VERSION_TAG" -m "TweetCraft v1.1.0"
fi

git push origin "$VERSION_TAG"

printf "\n✅ TweetCraft 已上传到私有 GitHub 仓库。\n"
printf "   仓库：%s/%s\n" "$GH_USER" "$REPO_NAME"

gh repo view --web
