import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  useNavigate,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import appCss from "../styles.css?url";
import { reportError } from "../lib/error-reporting";
import { SmoothScroll } from "../components/vexon/SmoothScroll";
import { GuideWidget } from "../components/vexon/GuideWidget";
import {
  getMyOnboarding,
  shouldPromptForOnboarding,
} from "../lib/onboarding-core";
import { useAuth } from "../lib/use-auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      // Each content route, / included, should set its own head(). Do not add og:image or
      // twitter:image here: every page without its own would inherit the root's preview image.
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "VEXON TECH" },
        {
          name: "description",
          content: "VEXON TECH — useful ideas, real-world progress.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        {
          rel: "stylesheet",
          href: appCss,
        },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@112,600;112,800&family=Inter+Tight:wght@400;500&family=JetBrains+Mono:wght@400&display=swap",
        },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <WebAnalytics />
      <OnboardingRedirect />
      <SmoothScroll />
      <GuideWidget />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}

/** Explicitly tracks TanStack client-side route changes, without query strings. */
function WebAnalytics() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return <Analytics route={pathname} path={pathname} />;
}

/** First-time users return to / from email confirmation, Google, and WhatsApp callbacks. */
function OnboardingRedirect() {
  const auth = useAuth();
  const pathname = useLocation({ select: (location) => location.pathname });
  const navigate = useNavigate();
  const checked = useRef("");
  const userId = auth.status === "signed-in" ? auth.user.id : null;

  useEffect(() => {
    if (!userId || (pathname !== "/" && pathname !== "/auth")) {
      checked.current = "";
      return;
    }
    const key = `${userId}:${pathname}`;
    if (checked.current === key) return;
    checked.current = key;
    let active = true;
    void getMyOnboarding()
      .then((preferences) => {
        if (active && shouldPromptForOnboarding(preferences.status)) {
          void navigate({ to: "/profile" });
        }
      })
      .catch(() => {
        // A missing/unavailable preferences table must not block access to the site.
        if (checked.current === key) checked.current = "";
      });
    return () => {
      active = false;
    };
  }, [navigate, pathname, userId]);

  return null;
}
