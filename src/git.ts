import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";

export function detectWorktreeIdentity(workspacePath: string): string {
  const realPath = safeRealpath(workspacePath);

  try {
    const topLevel = runGit(["rev-parse", "--show-toplevel"], realPath);
    const gitDir = runGit(["rev-parse", "--absolute-git-dir"], realPath);
    return `${safeRealpath(topLevel)}::${safeRealpath(gitDir)}`;
  } catch {
    return realPath;
  }
}

function runGit(args: string[], cwd: string): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();
}

function safeRealpath(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}
