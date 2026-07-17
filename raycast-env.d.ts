/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Gemini API Key - API key created in Google AI Studio. Raycast stores password preferences securely. */
  "apiKey": string,
  /** Gemini Model - The Gemini model used for rewriting. */
  "model": "gemini-3.5-flash" | "gemini-3.1-flash-lite" | "gemini-2.5-flash",
  /** Network Mode - Auto tries the local proxy first, then a direct connection only when the proxy cannot be reached. */
  "networkMode": "auto" | "proxy" | "direct",
  /** Proxy URL - Your local HTTP proxy. The current setup uses port 7897. */
  "proxyUrl": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `natural` command */
  export type Natural = ExtensionPreferences & {}
  /** Preferences accessible in the `punchy` command */
  export type Punchy = ExtensionPreferences & {}
  /** Preferences accessible in the `short` command */
  export type Short = ExtensionPreferences & {}
  /** Preferences accessible in the `reply` command */
  export type Reply = ExtensionPreferences & {}
  /** Preferences accessible in the `check-setup` command */
  export type CheckSetup = ExtensionPreferences & {}
  /** Preferences accessible in the `recent-drafts` command */
  export type RecentDrafts = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `natural` command */
  export type Natural = {
  /** 输入中文内容 */
  "text": string
}
  /** Arguments passed to the `punchy` command */
  export type Punchy = {
  /** 输入中文内容 */
  "text": string
}
  /** Arguments passed to the `short` command */
  export type Short = {
  /** 输入中文内容 */
  "text": string
}
  /** Arguments passed to the `reply` command */
  export type Reply = {
  /** 输入中文回复 */
  "text": string
}
  /** Arguments passed to the `check-setup` command */
  export type CheckSetup = {}
  /** Arguments passed to the `recent-drafts` command */
  export type RecentDrafts = {}
}

