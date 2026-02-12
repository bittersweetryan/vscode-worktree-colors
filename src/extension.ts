import * as vscode from "vscode";
import { buildStatusBarTheme } from "./color";
import { detectWorktreeIdentity } from "./git";

const MANAGED_KEYS = [
  "statusBar.background",
  "statusBar.foreground",
  "statusBar.debuggingBackground",
  "statusBar.noFolderBackground"
] as const;

type ColorCustomizations = Record<string, unknown>;
let isUpdatingColors = false;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const reapply = async () => {
    if (isUpdatingColors) {
      return;
    }
    await applyWorktreeColor();
  };

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(reapply),
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (
        event.affectsConfiguration("cursorWorktreeColors") ||
        event.affectsConfiguration("workbench.colorCustomizations")
      ) {
        await reapply();
      }
    })
  );

  await applyWorktreeColor();
}

export function deactivate(): void {
  // Intentionally empty. Colors remain in workspace settings until changed.
}

async function applyWorktreeColor(): Promise<void> {
  const cfg = vscode.workspace.getConfiguration("cursorWorktreeColors");
  const enabled = cfg.get<boolean>("enabled", true);
  const saturation = cfg.get<number>("saturation", 44);
  const lightness = cfg.get<number>("lightness", 78);

  if (!enabled) {
    await clearManagedColors();
    return;
  }

  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    return;
  }

  const identity = detectWorktreeIdentity(folder.uri.fsPath);
  const theme = buildStatusBarTheme(identity, { saturation, lightness });

  const workbenchCfg = vscode.workspace.getConfiguration("workbench");
  const existing = (workbenchCfg.get<ColorCustomizations>("colorCustomizations") ?? {}) as ColorCustomizations;
  const next = { ...existing };

  next["statusBar.background"] = theme.background;
  next["statusBar.foreground"] = theme.foreground;
  next["statusBar.debuggingBackground"] = theme.background;
  next["statusBar.noFolderBackground"] = theme.background;

  if (!managedColorsChanged(existing, next)) {
    return;
  }

  isUpdatingColors = true;
  try {
    await workbenchCfg.update("colorCustomizations", next, vscode.ConfigurationTarget.Workspace);
  } finally {
    isUpdatingColors = false;
  }
}

async function clearManagedColors(): Promise<void> {
  const workbenchCfg = vscode.workspace.getConfiguration("workbench");
  const existing = (workbenchCfg.get<ColorCustomizations>("colorCustomizations") ?? {}) as ColorCustomizations;

  const next = { ...existing };
  for (const key of MANAGED_KEYS) {
    delete next[key];
  }

  if (!managedColorsChanged(existing, next)) {
    return;
  }

  isUpdatingColors = true;
  try {
    await workbenchCfg.update("colorCustomizations", next, vscode.ConfigurationTarget.Workspace);
  } finally {
    isUpdatingColors = false;
  }
}

function managedColorsChanged(
  before: ColorCustomizations,
  after: ColorCustomizations
): boolean {
  return MANAGED_KEYS.some((key) => before[key] !== after[key]);
}
