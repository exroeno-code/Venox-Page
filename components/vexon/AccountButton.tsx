import { Link } from "@tanstack/react-router";
import { LogOut, User, UserCog } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials, signOut } from "@/lib/auth-core";
import { useAuth } from "@/lib/use-auth";

const LABEL =
  "hidden font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground md:inline";
const CIRCLE =
  "grid size-11 place-items-center rounded-full border bg-card/40 backdrop-blur transition-colors group-hover:border-glow group-focus-visible:border-glow";

/** Round account icon for the top-right corner. Signed out: links to /auth. Signed in: initials + menu. */
export function AccountButton() {
  const auth = useAuth();

  if (auth.status === "signed-in") {
    const { user } = auth;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
          aria-label={`Vexon account menu for ${user.name}`}
        >
          <span className={LABEL}>Vexon account</span>
          <span className={`${CIRCLE} border-glow/60 font-display text-sm font-semibold`}>{initials(user)}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 border bg-card text-foreground">
          <DropdownMenuLabel className="font-normal">
            <div className="truncate font-display text-base font-semibold">{user.name}</div>
            <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer gap-2">
            <Link to="/profile">
              <UserCog className="size-4" /> Your profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void signOut()} className="cursor-pointer gap-2">
            <LogOut className="size-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Signed out, and while the saved session is still loading (same size, so nothing shifts).
  return (
    <Link
      to="/auth"
      aria-label="Vexon account: sign in or create an account"
      className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
    >
      <span className={LABEL}>Vexon account</span>
      <span className={CIRCLE}>
        <User className="size-5" />
      </span>
    </Link>
  );
}
