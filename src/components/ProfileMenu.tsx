import { useEffect, useId, useRef, useState } from "react";
import type { User } from "../types";
import { useDirection } from "../lib/direction";
import { Avatar } from "./Avatar";
import { AppButton } from "./AppButton";
import styles from "./ProfileMenu.module.css";

export function ProfileMenu({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const { dir, toggle: toggleDir } = useDirection();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={styles.root}>
      <button ref={trigger} type="button" className={styles.trigger} aria-haspopup="dialog" aria-expanded={open} aria-controls={id} aria-label={`Profile: ${user.name}`} onClick={() => setOpen((o) => !o)}>
        <Avatar user={user} size={36} />
      </button>
      {open && (
        <div id={id} role="dialog" aria-label="Profile" className={styles.card}>
          <div className={styles.who}>
            <Avatar user={user} size={48} />
            <div className={styles.text}>
              <strong className={styles.name}>{user.name}</strong>
              <span className={`${styles.email} muted`}>{user.email}</span>
            </div>
          </div>
          <div className={styles.row}>
            <span>Text direction</span>
            <AppButton onClick={toggleDir} aria-label={`Text direction: ${dir === "rtl" ? "right to left" : "left to right"}. Switch`}>
              {dir === "rtl" ? "RTL" : "LTR"}
            </AppButton>
          </div>
          <AppButton block onClick={onSignOut}>
            Sign out
          </AppButton>
        </div>
      )}
    </div>
  );
}
