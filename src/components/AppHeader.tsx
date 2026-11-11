import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useTheme } from "../lib/theme";
import { ProfileMenu } from "./ProfileMenu";
import { AppButton } from "./AppButton";
import styles from "./AppHeader.module.css";

export function AppHeader({ workspaceName }: { workspaceName?: string }) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/boards" className={styles.logo}>
          <span className={styles.mark} aria-hidden="true" />
          CollabBoard
        </Link>
        <nav className={styles.nav} aria-label="Primary">
          <NavLink to="/boards" end={false} className={({ isActive }) => (isActive ? `${styles.navLink} ${styles.active}` : styles.navLink)}>
            Boards
          </NavLink>
          {workspaceName && <span className={styles.chip}>{workspaceName}</span>}
        </nav>
      </div>
      <div className={styles.right}>
        <AppButton onClick={toggle} aria-label="Toggle color theme">
          Theme: {theme === "paper" ? "Paper" : "Dark"}
        </AppButton>
        {user && <ProfileMenu user={user} onSignOut={() => void signOut()} />}
      </div>
    </header>
  );
}
