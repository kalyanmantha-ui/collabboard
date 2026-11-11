import type { DragEvent, ReactNode } from "react";
import { AppButton } from "../../components/AppButton";
import styles from "./Column.module.css";

export type ColumnState = "loading" | "error" | "empty" | "ready";

interface Props {
  name: string;
  count: number;
  state: ColumnState;
  active: boolean;
  isDropTarget: boolean;
  skeletons: number;
  onAdd: () => void;
  onRetry: () => void;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
  onDragLeave: (e: DragEvent<HTMLElement>) => void;
  children: ReactNode;
}

export function Column({ name, count, state, active, isDropTarget, skeletons, onAdd, onRetry, onDragOver, onDrop, onDragLeave, children }: Props) {
  return (
    <section
      className={`${styles.column} ${isDropTarget ? styles.target : ""}`}
      data-active={active}
      aria-label={name}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      <header className={styles.head}>
        <h2>{name}</h2>
        <span className="muted" aria-label={`${count} tasks`}>
          {state === "loading" ? "Loading" : state === "error" ? "Error" : state === "empty" ? "Empty" : count}
        </span>
      </header>

      {state === "loading" && (
        <div className={styles.list} aria-busy="true" aria-label={`Loading ${name}`}>
          {Array.from({ length: skeletons }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <span className={`${styles.bar} ${styles.short}`} />
              <span className={`${styles.bar} ${styles.long}`} style={{ width: `${55 + ((i * 17) % 35)}%` }} />
              <span className={styles.skelFoot}>
                <span className={`${styles.bar} ${styles.short} ${styles.faint}`} />
                <span className={styles.dot} />
              </span>
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <div className={styles.errorBox} role="alert">
          <span className={styles.errIcon} aria-hidden="true">!</span>
          <h3>Couldn't load tasks</h3>
          <p>Check your connection and try again.</p>
          <AppButton onClick={onRetry}>Retry</AppButton>
        </div>
      )}

      {state === "empty" && (
        <div className={styles.emptyBox}>
          <svg className={styles.art} viewBox="0 0 64 64" aria-hidden="true">
            <rect x="8" y="12" width="48" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <rect x="8" y="30" width="48" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 4" />
            <path d="M32 48v10m-5-5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3>Start this column</h3>
          <p>Drag a task here, or create one to get moving.</p>
          <AppButton onClick={onAdd}>New task</AppButton>
        </div>
      )}

      {state === "ready" && <div className={styles.list}>{children}</div>}

      {(state === "ready" || state === "empty") && (
        <div className={styles.foot}>
          <AppButton variant="dashed" block onClick={onAdd}>
            Add task
          </AppButton>
        </div>
      )}
    </section>
  );
}
