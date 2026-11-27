import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InstagramIcon, WhatsAppIcon } from "@/components/vexon/SocialIcons";

describe("social brand icons", () => {
  it("renders Instagram with its official multicolor gradient mark", () => {
    const { container } = render(<InstagramIcon className="size-5" />);
    const gradient = container.querySelector("linearGradient");
    const colors = Array.from(gradient?.querySelectorAll("stop") ?? []).map(
      (stop) => stop.getAttribute("stop-color"),
    );

    expect(gradient).toBeInTheDocument();
    expect(colors).toEqual([
      "#feda75",
      "#fa7e1e",
      "#d62976",
      "#962fbf",
      "#4f5bd5",
    ]);
    expect(container.querySelector("rect")?.getAttribute("fill")).toBe(
      `url(#${gradient?.id})`,
    );
  });

  it("uses WhatsApp green by default and white for green button backgrounds", () => {
    const { container, rerender } = render(<WhatsAppIcon />);

    expect(container.querySelector("svg")).toHaveAttribute("stroke", "#25d366");

    rerender(<WhatsAppIcon variant="inverse" />);
    expect(container.querySelector("svg")).toHaveAttribute("stroke", "#fff");
  });
});
