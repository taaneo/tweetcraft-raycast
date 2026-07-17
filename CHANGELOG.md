# Changelog

## 1.1.0

- Save the Chinese source locally before starting any Gemini request.
- Copy the original Chinese text automatically when translation fails.
- Added `Recent TweetCraft Drafts` for recovery, copying, retrying, and deletion.
- Keep up to 50 records and remove records after 30 days without updates.
- Deduplicate identical text submitted with the same mode within five minutes.
- Record structured failure categories such as timeout, proxy, network, quota, API key, and model errors.
- Update the original record after a successful retry instead of creating a duplicate.
- Keep the Gemini API key out of local history.

## 1.0.0

- Added Natural, Punchy, Short, and Reply rewriting commands.
- Added automatic clipboard copy and Raycast HUD feedback.
- Added Gemini API key, model, network mode, and proxy preferences.
- Added proxy-aware Gemini requests and connection diagnostics.
