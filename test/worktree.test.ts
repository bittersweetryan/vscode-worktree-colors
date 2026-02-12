import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterAll, describe, expect, it } from "vitest";
import { buildStatusBarTheme } from "../src/color";
import { detectWorktreeIdentity } from "../src/git";

const tempRoots: string[] = [];

describe("git worktree identity", () => {
  afterAll(async () => {
    await Promise.all(tempRoots.map((root) => rm(root, { recursive: true, force: true })));
  });

  it("creates different identities and colors for different worktrees", () => {
    const root = mkdtempSync(join(tmpdir(), "cursor-worktree-colors-"));
    tempRoots.push(root);

    const main = join(root, "main");
    runGit(["init", main], root);
    writeFileSync(join(main, "README.md"), "hello\n", "utf8");
    runGit(["-C", main, "add", "README.md"], root);
    runGit(["-C", main, "-c", "user.name=Test User", "-c", "user.email=test@example.com", "commit", "-m", "init"], root);

    const branchName = "worktree-branch";
    runGit(["-C", main, "branch", branchName], root);
    const siblingWorktree = join(root, "sibling");
    runGit(["-C", main, "worktree", "add", siblingWorktree, branchName], root);

    const firstIdentity = detectWorktreeIdentity(main);
    const secondIdentity = detectWorktreeIdentity(siblingWorktree);
    expect(firstIdentity).not.toBe(secondIdentity);

    const firstTheme = buildStatusBarTheme(firstIdentity, { saturation: 44, lightness: 78 });
    const secondTheme = buildStatusBarTheme(secondIdentity, { saturation: 44, lightness: 78 });
    expect(firstTheme.background).not.toBe(secondTheme.background);
  });
});

function runGit(args: string[], cwd: string): void {
  execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}
