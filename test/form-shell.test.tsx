import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormShell } from "@/components/vexon/FormShell";

describe("FormShell", () => {
  it("shows the shared VEXON mark, title, reason, and completion-time hint", () => {
    const { container } = render(
      <FormShell
        title="Join the list"
        reason="Get updates by email."
        timeHint="Takes about 30 seconds"
      >
        <button type="submit">Continue</button>
      </FormShell>,
    );

    expect(
      screen.getByRole("heading", { name: "Join the list" }),
    ).toBeInTheDocument();
    expect(container.querySelector("span.font-display")?.textContent).toContain(
      "EXVANO LABS",
    );
    expect(screen.getByText("Get updates by email.")).toBeInTheDocument();
    expect(screen.getByText("Takes about 30 seconds")).toBeInTheDocument();
    const mark = container.querySelector('img[src="/brand/vexvano-labs-v.png"]');
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveAttribute("alt", "V");
  });
});
