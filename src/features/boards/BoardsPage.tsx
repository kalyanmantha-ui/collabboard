import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../lib/auth";
import { plural, relativeDay } from "../../lib/format";
import type { BoardSummary, Workspace } from "../../types";
import { AppHeader } from "../../components/AppHeader";
import { AppButton } from "../../components/AppButton";
import { NameDialog } from "../../components/NameDialog";
import styles from "./BoardsPage.module.css";

export function BoardsPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [dialog, setDialog] = useState<"board" | "workspace" | null>(null);

  useEffect(() => {
    api.listWorkspaces().then(setWorkspaces, () => setError(true));
  }, []);

  const wsId = params.get("ws") ?? workspaces?.[0]?.id;
  const workspace = workspaces?.find((w) => w.id === wsId);

  const loadBoards = useCallback(() => {
    if (!wsId) return;
    setBoards(null);
    setError(false);
    api.listBoards(wsId).then(setBoards, () => setError(true));
  }, [wsId]);
  useEffect(loadBoards, [loadBoards]);

  return (
    <div className="page">
      <AppHeader />
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Workspaces">
          <p className={styles.sidebarTitle}>Workspaces</p>
          <ul className={styles.wsList}>
            {workspaces?.map((w) => (
              <li key={w.id}>
                <button className={`${styles.ws} ${w.id === wsId ? styles.wsActive : ""}`} aria-current={w.id === wsId ? "page" : undefined} onClick={() => setParams({ ws: w.id })}>
                  {w.name}
                </button>
              </li>
            ))}
          </ul>
          <AppButton variant="dashed" block onClick={() => setDialog("workspace")}>
            New workspace
          </AppButton>
        </aside>

        <main className={styles.main}>
          <div className={styles.titleRow}>
            <div>
              <p className={`${styles.crumb} muted`}>{workspace?.name ?? " "}</p>
              <h1>Boards</h1>
            </div>
            <AppButton variant="primary" onClick={() => setDialog("board")} disabled={!workspace}>
              New board
            </AppButton>
          </div>

          {error ? (
            <div className={styles.error} role="alert">
              <h2>Couldn't load boards</h2>
              <p className="muted">Check your connection and try again.</p>
              <AppButton onClick={loadBoards}>Retry</AppButton>
            </div>
          ) : boards === null ? (
            <ul className={styles.grid} aria-busy="true" aria-label="Loading boards">
              {[0, 1, 2].map((i) => (
                <li key={i} className={`${styles.card} ${styles.skeleton}`} />
              ))}
            </ul>
          ) : (
            <ul className={styles.grid}>
              {boards.map((b) => (
                <li key={b.id}>
                  <Link to={`/boards/${b.id}`} className={styles.card} style={{ ["--strip" as string]: b.color }}>
                    <span className={styles.strip} aria-hidden="true" />
                    <span className={styles.cardBody}>
                      <h2>{b.name}</h2>
                      <span className={`${styles.desc} muted`}><bdi>{b.description}</bdi></span>
                      <span className={`${styles.meta} muted`}>
                        <span>
                          <bdi>
                          {plural(b.taskCount, "task")}, {plural(b.memberIds.length, "member")}
                        </bdi>
                        </span>
                        <bdi>Updated {relativeDay(b.updatedAt)}</bdi>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <button className={styles.newCard} onClick={() => setDialog("board")}>
                  New board
                </button>
              </li>
            </ul>
          )}
          <p className={styles.reset}>
            <button
              className={styles.resetBtn}
              onClick={() => {
                api.resetDemo();
                window.location.assign("/login");
              }}
            >
              Reset demo data
            </button>
          </p>
        </main>
      </div>

      {dialog === "board" && workspace && user && (
        <NameDialog
          title="New board"
          submitLabel="Create board"
          withDescription
          onClose={() => setDialog(null)}
          onSubmit={async (name, description) => {
            await api.createBoard(workspace.id, name, description, user.id);
            loadBoards();
          }}
        />
      )}
      {dialog === "workspace" && (
        <NameDialog
          title="New workspace"
          submitLabel="Create workspace"
          onClose={() => setDialog(null)}
          onSubmit={async (name) => {
            const ws = await api.createWorkspace(name);
            setWorkspaces((prev) => [...(prev ?? []), ws]);
            setParams({ ws: ws.id });
          }}
        />
      )}
    </div>
  );
}
