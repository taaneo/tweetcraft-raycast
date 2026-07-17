# TweetCraft for Gemini

把中文想法改写成自然英文 X 帖子，并自动复制到剪贴板。

## 命令

| 推荐 Alias | 命令                     | 用途                                   |
| ---------- | ------------------------ | -------------------------------------- |
| `tp`       | Natural English Post     | 自然、日常、保留原本语气               |
| `tpx`      | Punchy English Post      | 更有冲击力，适合产品和创业观点         |
| `tps`      | Short English Post       | 压缩到约 140 字符                      |
| `tpr`      | Natural English Reply    | 自然英文回复                           |
| `tph`      | Recent TweetCraft Drafts | 找回中文、复制结果、重新翻译或删除记录 |

输入中文后按 Enter，结果会直接进入剪贴板。

## v1.1：本地草稿保护

每次翻译都会先把中文写入 Raycast 的扩展本地存储，然后才调用 Gemini。

- 翻译成功：英文复制到剪贴板，中文和英文留在本地历史。
- 翻译失败：原中文自动复制到剪贴板，失败原因写入本地历史。
- 本地草稿保存失败：不会发送 Gemini 请求，原中文会直接复制到剪贴板。
- 最近最多保存 50 条。
- 超过 30 天未更新的记录会自动清理。
- 5 分钟内用同一模式重复提交相同中文，会更新原记录，不会大量创建重复项。
- 重新翻译会更新同一条记录。
- API Key 不写入历史；历史只保存在本机扩展存储中，不上传到任何额外服务。

`Recent TweetCraft Drafts` 支持：

- 复制中文原文
- 复制英文结果
- 重新翻译
- 查看最近错误类型和信息
- 删除单条记录
- 清空全部历史

## 从 v1.0 升级

1. 解压 v1.1。
2. 用 v1.1 文件覆盖原来的 TweetCraft 扩展目录，或者把新目录放到长期保存的位置。
3. 在该目录运行：

```bash
npm install
npm run dev
```

4. Raycast 重新载入扩展后，可以在 Terminal 按 `Control-C`。
5. 给 `Recent TweetCraft Drafts` 设置 Alias：`tph`。

扩展名称保持不变，因此原 Gemini 配置通常会继续保留。

## 首次安装

### 1. 确认 Node.js

在 Terminal 运行：

```bash
node -v
npm -v
```

如果命令不存在，请先安装 Node.js LTS。

### 2. 安装扩展

```bash
cd /你的路径/tweetcraft-raycast-v1.1.0
npm install
npm run dev
```

也可以双击 `install.command`。

### 3. 配置

第一次运行命令时，Raycast 会要求填写：

- Gemini API Key
- Gemini 模型（默认 `gemini-3.5-flash`）
- Network Mode（默认 Auto）
- Proxy URL（默认 `http://127.0.0.1:7897`）

API Key 使用 Raycast 的 password preference 保存。

### 4. 设置 Alias

在 Raycast 搜索命令，选中后按 `⌘ ,`，依次设置：

- Natural English Post → `tp`
- Punchy English Post → `tpx`
- Short English Post → `tps`
- Natural English Reply → `tpr`
- Recent TweetCraft Drafts → `tph`

## 使用

```text
tp 今天越来越觉得，AI 产品真正的竞争不是模型，而是谁能融入用户每天的工作流。
```

成功时英文自动复制到剪贴板。失败时原中文自动复制，并可通过 `tph` 找回和重试。

## 网络和代理

默认代理：

```text
http://127.0.0.1:7897
```

扩展默认使用 Auto：先通过该代理请求 Gemini；仅当代理发生连接错误时，再尝试直连。

可以运行 `Check Gemini Setup` 验证 API Key、模型和网络。

## 隐私

Gemini 请求只包含当前需要翻译的文本。TweetCraft 的历史记录使用 Raycast 扩展本地存储，保存中文原文、英文结果、模式、时间、状态和错误分类，不保存 Gemini API Key。
