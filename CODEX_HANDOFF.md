# Codex Handoff

Use this file to begin a new Codex session without relying on the previous ChatGPT conversation.

## Repository

```text
taaneo/tweetcraft-raycast
```

The repository is private.

Current branch:

```text
main
```

Current release:

```text
v1.1.0
```

## What the product does

TweetCraft is a Raycast extension powered by Gemini.

Primary workflow:

```text
⌥ Space
tp
<Chinese text>
↵
```

It rewrites the Chinese input into natural English for X and copies the result to the clipboard.

Commands:

- Natural
- Punchy
- Short
- Reply
- Check Setup
- Recent TweetCraft Drafts

Recommended aliases:

- `tp`
- `tpx`
- `tps`
- `tpr`
- `tph`

## Important implementation history

An earlier shell-based implementation failed in Raycast because Terminal had local proxy environment variables but Raycast did not inherit them.

The extension was redesigned as a TypeScript Raycast extension with explicit proxy-aware Gemini networking.

The user then identified a data-loss risk: if translation failed after Raycast closed, the original Chinese input disappeared.

The accepted solution was local draft protection rather than preemptively overwriting the clipboard.

Current safeguards:

- save original Chinese before any Gemini request,
- if saving fails, do not call Gemini,
- copy original Chinese on failure,
- copy English on success,
- keep local history,
- retry failed records,
- update a record after successful retry.

History rules:

- maximum 50 records,
- cleanup after 30 days,
- deduplicate identical input within 5 minutes,
- API key never enters history,
- local storage only,
- store error category.

Current error categories:

- timeout
- proxy
- network
- quota
- api_key
- model
- request
- unknown

## Known caveat

`npm run build` passed for v1.1.0.

Raycast lint may still complain that the manifest author is:

```text
your-raycast-username
```

That value should eventually be replaced with the user's real Raycast Store username. Do not confuse this manifest validation issue with TypeScript or functional errors.

Runtime behavior with the user's real Gemini API key was not independently tested in the build environment.

## First instructions for Codex

Start by reading:

1. `AGENTS.md`
2. `PROJECT.md`
3. `ARCHITECTURE.md`
4. `DECISIONS.md`
5. `ROADMAP.md`
6. `PROMPTS.md`
7. the current source files

Then run:

```bash
npm install
npm run build
```

Inspect the working tree before editing:

```bash
git status
```

For non-trivial work, create a branch:

```bash
git switch -c codex/<task-name>
```

## Recommended first task

A good first Codex task is:

> Audit the v1.1.0 local history and retry implementation. Add focused tests or testable pure helpers for the 50-record limit, 30-day cleanup, five-minute deduplication, and successful retry updating the original record. Preserve current UI and storage behavior. Run the build and report any lint issue separately.

This task improves reliability without changing the public workflow.

## Session bootstrap prompt

Paste this into a new Codex session:

```text
Read AGENTS.md, PROJECT.md, ARCHITECTURE.md, DECISIONS.md, ROADMAP.md, PROMPTS.md, and CODEX_HANDOFF.md before making changes.

This is a private Raycast extension called TweetCraft for Gemini. Preserve the local-first and failure-safe behavior. Never expose API keys or user drafts. Do not assume Raycast inherits Terminal proxy variables.

First inspect the repository and run the existing build. Then summarize the current architecture, identify the highest-risk reliability issue, and propose a small implementation plan before editing code.
```
