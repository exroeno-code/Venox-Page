import { Link } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-core";
import { useAuth } from "@/lib/use-auth";
import { UserAvatar } from "./UserAvatar";

const LABEL =
  "hidden font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#e6b94a] transition-colors group-hover:text-[#ffe9a2] group-focus-visible:text-[#ffe9a2] md:inline";
const CIRCLE =
  "grid size-11 place-items-center rounded-full border border-[#e6b94a]/70 bg-[#100d08]/95 text-[#ffe7a2] shadow-[0_0_22px_2px_rgba(230,185,74,.24),inset_0_0_20px_rgba(230,185,74,.1)] backdrop-blur transition-all group-hover:border-[#ffe9a2] group-hover:shadow-[0_0_24px_3px_rgba(230,185,74,.42)] group-focus-visible:border-[#f0cc70]";

/** Round account icon for the top-right corner. Signed out: links to /auth. Signed in: initials + menu. */
export function AccountButton() {
  const auth = useAuth();

  if (auth.status === "signed-in") {
    const { user } = auth;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#f0cc70]/60"
          aria-label={`Vexvano Labs account menu for ${user.name}`}
        >
          <span className={LABEL}>Vexvano Labs account</span>
          <UserAvatar user={user} className="size-11 text-sm" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 border bg-card text-foreground"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="truncate font-display text-base font-semibold">
              {user.name}
            </div>
            <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              {user.email || user.phone || "Vexvano Labs account"}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => void signOut()}
            className="cursor-pointer gap-2"
          >
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
      aria-label="Vexvano Labs account: sign in or create an account"
      className="group flex items-center gap-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#f0cc70]/60"
    >
      <span className={LABEL}>Vexvano Labs account</span>
      <span className={CIRCLE}>
        <User className="size-5" />
      </span>
    </Link>
  );
}
