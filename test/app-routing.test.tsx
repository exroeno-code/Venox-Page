import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { Route as ProfileRoute } from "@/routes/profile";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
  });

  it.each([
    "/",
    "/auth",
    "/leadership",
    "/contact",
    "/assistant",
    "/roadmap",
    "/profile",
    "/goods-trade",
    "/forex-trading",
    "/community",
    "/learning",
    "/privacy",
    "/trading",
  ])(
    "matches a page or legacy redirect for %s instead of falling back to not found",
    (path) => {
      const matches = router.matchRoutes(path);

      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    },
  );

  it("redirects the removed profile dashboard to the home page", () => {
    let redirectError: unknown;
    try {
      ProfileRoute.options.beforeLoad?.({} as never);
    } catch (error) {
      redirectError = error;
    }
    expect(redirectError).toMatchObject({
      options: { to: "/", replace: true },
    });
  });
});
