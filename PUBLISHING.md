# Publishing to VS Code Marketplace

This document describes how to publish `cursor-worktree-colors` to the VS Code Marketplace.

## 1) Prerequisites

- A Microsoft/Azure DevOps account
- A Marketplace publisher ID
- A Personal Access Token (PAT) with `Marketplace (Manage)` scope
- Node/npm installed locally

## 2) Create a publisher

Create your publisher in Azure DevOps Marketplace management.

Update `package.json` so `publisher` exactly matches that publisher ID:

```json
{
  "publisher": "your-publisher-id"
}
```

## 3) Update manifest metadata (recommended)

Before first public release, add/verify:

- `repository`
- `homepage`
- `bugs`
- `icon` (128x128 png)
- `license` (already set to MIT)

Example:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/cursor-worktree-colors.git"
  },
  "homepage": "https://github.com/your-org/cursor-worktree-colors#readme",
  "bugs": {
    "url": "https://github.com/your-org/cursor-worktree-colors/issues"
  },
  "icon": "images/icon.png"
}
```

## 4) Login with vsce

From repo root:

```bash
npx @vscode/vsce login your-publisher-id
```

Paste your PAT when prompted.

## 5) Build and validate

```bash
npm run compile
npm test
npx @vscode/vsce package
```

If needed, inspect the produced `.vsix` and fix warnings/errors.

## 6) Publish

Patch release:

```bash
npx @vscode/vsce publish patch
```

Minor/major:

```bash
npx @vscode/vsce publish minor
npx @vscode/vsce publish major
```

Or publish the exact version currently in `package.json`:

```bash
npx @vscode/vsce publish
```

## 7) Post-publish verification

- Verify Marketplace page and README rendering
- Install from Marketplace in a clean Cursor/VS Code profile
- Confirm startup activation and per-worktree color behavior

## Project-specific notes for this repo

- Current package version in this repo is `0.0.3` (update as needed before publish).
- `publisher` is currently `local-dev`; this must be changed before Marketplace publishing.
- Activation currently uses `"*"` to reduce status bar color flash at startup.
