import type { CSSProperties } from "react";
import type { User } from "../types";

export function Avatar({ user, size = 28 }: { user: User | null | undefined; size?: number }) {
  if (!user) return null;
  return (
    <span className="avatar" data-tone={user.tone} style={{ "--size": `${size}px` } as CSSProperties} title={user.name} role="img" aria-label={user.name}>
      {user.initials}
    </span>
  );
}

export function AvatarStack({ users }: { users: User[] }) {
  return (
    <span className="avatar-stack" aria-label={`${users.length} members`}>
      {users.map((u) => (
        <Avatar key={u.id} user={u} />
      ))}
    </span>
  );
}
