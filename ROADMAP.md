# Roadmap

This roadmap is directional. Preserve current behavior while shipping changes incrementally.

## Current: v1.1.0

Completed:

- Natural, Punchy, Short, and Reply modes
- Setup check
- Clipboard-first output
- Explicit proxy support
- Local draft protection before network requests
- Recent draft history
- Retry flow
- Error categories
- 50-record limit
- 30-day cleanup
- Five-minute deduplication
- Successful retry updates the original record

## v1.2 — Reliability and recovery

Goal: make failure states predictable and easy to recover from.

Candidate work:

- Improve history schema versioning and migration.
- Add clearer retry status and progress feedback.
- Add tests for cleanup, deduplication, retry updates, and record limits.
- Improve timeout handling.
- Make proxy diagnostics more actionable.
- Add safe handling for malformed Gemini responses.
- Ensure concurrent submissions cannot corrupt local history.
- Review whether retry should preserve the original style mode automatically.

Exit criteria:

- recovery behavior has automated tests,
- no duplicate record is created during a successful retry,
- all failure paths retain the original Chinese text,
- build passes.

## v1.3 — Prompt quality

Goal: move from translation toward native rewriting for X.

Candidate work:

- Improve the Natural mode for idiomatic English.
- Add stronger sentence restructuring where literal translation sounds unnatural.
- Preserve uncertainty, tone, and factual boundaries.
- Reduce generic AI phrasing.
- Build a small prompt evaluation set with expected characteristics.
- Add configurable output preferences only when they improve the keyboard-first workflow.

Example target transformation:

```text
今天越来越觉得 AI 产品真正竞争的是工作流。
```

Possible native rewrite:

```text
AI products are increasingly competing on workflow, not just models.
```

The model must not invent extra claims merely to make a post more dramatic.

## v1.4 — More writing modes

Potential modes:

- Founder
- Fast Take
- Conversational
- Minimal
- Technical
- Quote Reply

Any new command should have:

- a clear use case,
- a stable prompt contract,
- a sensible alias,
- reuse of the shared rewrite pipeline,
- history support.

Avoid naming a mode after a living writer as a direct style imitation. Describe the desired traits instead.

## v2.0 — Thread generation

Goal: turn one Chinese idea into a coherent short thread.

Potential capabilities:

- generate a configurable number of posts,
- maintain one argument across the thread,
- respect X length constraints,
- copy the complete thread,
- copy one post at a time,
- save and retry thread drafts locally,
- avoid repetitive hooks and conclusions.

This should be implemented as a separate command rather than silently changing existing single-post modes.

## Future exploration

- LinkedIn mode
- Reddit mode
- Hacker News mode
- GitHub release notes
- Product Hunt launch copy
- Shared core under a broader WriteCraft name

These are not commitments. Validate the X workflow before broadening the product.
