import { createFileRoute, redirect } from "@tanstack/react-router";

/** Keep old bookmarks and OAuth callbacks from landing on the removed dashboard. */
export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
