import { useState } from "react";

import { initials, type VexonUser } from "@/lib/auth-core";

/** Round profile picture with an initials fallback when there is no picture or it fails to load. */
export function UserAvatar({
  user,
  className = "",
}: {
  user: VexonUser;
  className?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(user.avatarUrl) && failedUrl !== user.avatarUrl;

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#e6b94a]/80 bg-[#100d08] font-display font-semibold text-[#ffe7a2] shadow-[0_0_18px_1px_rgba(230,185,74,.22)] ${className}`}
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
