import { useState } from "react";

import { initials, type VexonUser } from "@/lib/auth-core";

/** Round profile picture with an initials fallback when there is no picture or it fails to load. */
export function UserAvatar({ user, className = "" }: { user: VexonUser; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(user.avatarUrl) && failedUrl !== user.avatarUrl;

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-primary/70 bg-card font-display font-semibold text-primary ${className}`}
    >
      {showImage ? (
        <img
          src={user.avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setFailedUrl(user.avatarUrl ?? null)}
        />
      ) : (
        <span aria-hidden="true">{initials(user)}</span>
      )}
    </span>
  );
}
