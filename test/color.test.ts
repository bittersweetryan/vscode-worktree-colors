import { describe, expect, it } from "vitest";
import { buildStatusBarTheme, hashToHue, hslToHex, toHslColor } from "../src/color";

describe("color generation", () => {
  it("produces stable hue for same input", () => {
    const first = hashToHue("/repo/worktree-a::.git/worktrees/a");
    const second = hashToHue("/repo/worktree-a::.git/worktrees/a");
    expect(first).toBe(second);
  });

  it("produces different hue for different inputs", () => {
    const first = hashToHue("/repo/worktree-a::.git/worktrees/a");
    const second = hashToHue("/repo/worktree-b::.git/worktrees/b");
    expect(first).not.toBe(second);
  });

  it("builds status bar theme with hex background", () => {
    const theme = buildStatusBarTheme("/repo/worktree-a::.git/worktrees/a", {
      saturation: 44,
      lightness: 78
    });

    expect(theme.background).toMatch(/^#[0-9a-f]{6}$/);
    expect(theme.background).not.toBe("#ff0000");
    expect(theme.foreground).toBe("#1f2937");
  });

  it("formats hsl values correctly", () => {
    expect(toHslColor(210, 40, 80)).toBe("hsl(210, 40%, 80%)");
  });

  it("converts hsl to hex correctly", () => {
    expect(hslToHex(0, 100, 50)).toBe("#ff0000");
    expect(hslToHex(120, 100, 50)).toBe("#00ff00");
    expect(hslToHex(240, 100, 50)).toBe("#0000ff");
  });
});
