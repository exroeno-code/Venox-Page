import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const topBar = readFileSync(
  resolve(process.cwd(), "components/vexon/TopBar.tsx"),
  "utf8",
);

describe("EmviUI navigation cards", () => {
  it("uses a single-column card grid on mobile and expands at tablet/desktop breakpoints", () => {
    expect(topBar).toContain(
      'className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"',
    );
  });

  it("keeps cards large enough to read at phone and desktop sizes", () => {
    expect(topBar).toContain("min-h-52");
    expect(topBar).toContain("p-5");
    expect(topBar).toContain("sm:p-6");
    expect(topBar).toContain("focus-visible:ring-2");
  });
});
