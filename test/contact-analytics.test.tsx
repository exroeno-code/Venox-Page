import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Contact } from "@/routes/contact";

const { sendContactMessage, track } = vi.hoisted(() => ({
  sendContactMessage: vi.fn(),
  track: vi.fn(),
}));

vi.mock("@/lib/contact-core", () => ({
  CONTACT_FORM_ENABLED: true,
  ContactError: class ContactError extends Error {},
  MESSAGE_MAX: 2000,
  NAME_MAX: 80,
  sendContactMessage,
}));

vi.mock("@vercel/analytics/react", () => ({ track }));

vi.mock("@/components/vexon/PageShell", () => ({
  PageShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe("contact form analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendContactMessage.mockResolvedValue(undefined);
  });

  async function submitContactForm() {
    render(<Contact />);
    expect(screen.getByLabelText("Message")).toHaveAttribute("rows", "3");
    expect(screen.getByRole("link", { name: /prefer whatsapp/i })).toHaveAttribute("href", expect.stringContaining("wa.me/254798303978?text="));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Taylor Example" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "taylor@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "A useful feedback note with enough characters." },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Send message" }).closest("form")!,
    );
    await waitFor(() => expect(sendContactMessage).toHaveBeenCalledTimes(1));
  }

  it("tracks one event after a successful save without including form values", async () => {
    await submitContactForm();

    await waitFor(() =>
      expect(track).toHaveBeenCalledExactlyOnceWith("feedback_form_submission"),
    );
  });

  it("does not track an event when saving the message fails", async () => {
    sendContactMessage.mockRejectedValueOnce(new Error("save failed"));
    await submitContactForm();

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(track).not.toHaveBeenCalled();
  });
});
