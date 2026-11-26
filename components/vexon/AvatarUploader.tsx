import { Camera, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

import { AuthError, removeAvatar, uploadAvatar, type VexonUser } from "@/lib/auth-core";
import { UserAvatar } from "./UserAvatar";

/** Profile picture with buttons to upload a new photo or remove the current one. */
export function AvatarUploader({ user }: { user: VexonUser }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | "upload" | "remove">(null);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  async function handle(kind: "upload" | "remove", action: () => Promise<unknown>, done: string) {
    setBusy(kind);
    setMessage(null);
    try {
      await action();
      setMessage({ tone: "success", text: done });
    } catch (err) {
      setMessage({
        tone: "error",
        text: err instanceof AuthError ? err.message : "Something went wrong. Please try again.",
      });
    } finally {
      setBusy(null);
    }
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handle("upload", () => uploadAvatar(file), "Your picture has been updated.");
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-5">
        <div className="relative">
          <UserAvatar user={user} className="size-20 text-2xl" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy !== null}
            aria-label="Upload a new profile picture"
            className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-60"
          >
            <Camera className="size-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-xl font-semibold">{user.name}</div>
          <div className="truncate font-mono text-xs text-muted-foreground">
            {user.email || user.phone || "Vexon account"}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy !== null}
              className="rounded-md border border-primary/50 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
            >
              {busy === "upload" ? "Uploading…" : user.avatarUrl ? "Change photo" : "Add photo"}
            </button>
            {user.avatarUrl ? (
              <button
                type="button"
                onClick={() => void handle("remove", removeAvatar, "Your picture has been removed.")}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                {busy === "remove" ? "Removing…" : "Remove"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onFile}
      />
      <p className="mt-3 text-xs text-muted-foreground">JPG, PNG, WebP or GIF, up to 2 MB.</p>
      {message ? (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`mt-3 rounded-md border px-4 py-3 text-sm ${
            message.tone === "error"
              ? "border-red-400/40 bg-red-500/10 text-red-200"
              : "border-primary/40 bg-primary/10 text-foreground"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
