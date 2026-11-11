import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Dropdown } from "paper-ui";
import { AppHeader } from "../../components/AppHeader";
import { AppButton } from "../../components/AppButton";
import { AvatarStack } from "../../components/Avatar";
import { Menu } from "../../components/Menu";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../lib/theme";
import { useDirection } from "../../lib/direction";
import { plural } from "../../lib/format";
import { STATUSES, LABELS, type Status, type Task } from "../../types";
import { useBoard } from "./useBoard";
import { Column, type ColumnState } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskFormModal } from "./TaskFormModal";
import styles from "./BoardPage.module.css";

const ANY_ASSIGNEE = "Assignee";
const ANY_LABEL = "Label";
const ANY_DATE = "Due date";
const DATE_OPTIONS = [ANY_DATE, "Overdue", "Next 7 days", "No due date"];
const SKELETONS: Record<Status, number> = { todo: 3, in_progress: 2, done: 1 };

type Modal = { type: "new"; status: Status } | { type: "edit"; taskId: string } | null;
interface Drag {
  taskId: string;
  overStatus: Status | null;
  overIndex: number;
}

export function BoardPage() {
  const { boardId = "" } = useParams();
  const { user } = useAuth();
  const { toggle: toggleTheme } = useTheme();
  const { dir, toggle: toggleDir } = useDirection();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const board = useBoard(boardId);
  const { data, phase } = board;

  const [modal, setModal] = useState<Modal>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [tab, setTab] = useState<Status>("todo");
  const [notice, setNotice] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [assignee, setAssignee] = useState(ANY_ASSIGNEE);
  const [label, setLabel] = useState(ANY_LABEL);
  const [date, setDate] = useState(ANY_DATE);
  const filtering = query.trim() !== "" || assignee !== ANY_ASSIGNEE || label !== ANY_LABEL || date !== ANY_DATE;

  const openTaskId = params.get("task");
  const userById = useMemo(() => new Map((data?.members ?? []).map((u) => [u.id, u])), [data?.members]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2800);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (board.actionError) {
      setNotice(board.actionError);
      board.clearActionError();
    }
  }, [board.actionError, board]);

  const visible = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const week = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    const q = query.trim().toLowerCase();
    return (data?.tasks ?? []).filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
      if (assignee !== ANY_ASSIGNEE && userById.get(t.assigneeId ?? "")?.name !== assignee) return false;
      if (label !== ANY_LABEL && t.label !== label) return false;
      if (date === "Overdue" && !(t.dueDate && t.dueDate < today && t.status !== "done")) return false;
      if (date === "Next 7 days" && !(t.dueDate && t.dueDate >= today && t.dueDate <= week)) return false;
      if (date === "No due date" && t.dueDate) return false;
      return true;
    });
  }, [data?.tasks, query, assignee, label, date, userById]);

  const byStatus = (s: Status): Task[] => visible.filter((t) => t.status === s).sort((a, b) => a.order - b.order);
  const total = data?.tasks.length ?? 0;

  function columnState(s: Status): ColumnState {
    if (phase === "loading") return "loading";
    if (phase === "error") return "error";
    return byStatus(s).length === 0 && !(drag && drag.overStatus === s) ? "empty" : "ready";
  }

  const dragEnabled = !filtering;
  function overIndexFor(e: DragEvent<HTMLElement>, taskId: string): number {
    const cards = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("[data-card]")).filter((el) => el.dataset.dragging !== "true");
    let idx = 0;
    for (const el of cards) {
      const r = el.getBoundingClientRect();
      if (e.clientY > r.top + r.height / 2) idx++;
    }
    void taskId;
    return idx;
  }
  function onColumnDragOver(status: Status, e: DragEvent<HTMLElement>) {
    if (!drag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const idx = overIndexFor(e, drag.taskId);
    if (drag.overStatus !== status || drag.overIndex !== idx) setDrag({ ...drag, overStatus: status, overIndex: idx });
  }
  function onColumnDragLeave(e: DragEvent<HTMLElement>) {
    if (!drag || e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDrag({ ...drag, overStatus: null });
  }
  function onColumnDrop(status: Status, e: DragEvent<HTMLElement>) {
    if (!drag) return;
    e.preventDefault();
    const idx = overIndexFor(e, drag.taskId);
    const id = drag.taskId;
    setDrag(null);
    void board.moveTask(id, status, idx);
  }

  const openTask = data?.tasks.find((t) => t.id === openTaskId) ?? null;
  const editing = modal?.type === "edit" ? data?.tasks.find((t) => t.id === modal.taskId) : undefined;
  const closeTask = () => setParams((p) => { p.delete("task"); return p; }, { replace: true });
  const openTaskModal = (id: string) => setParams((p) => { p.set("task", id); return p; }, { replace: true });

  function invite() {
    void navigator.clipboard?.writeText(window.location.origin + `/boards/${boardId}`).catch(() => undefined);
    setNotice("Invite link copied");
  }

  if (!user) return null;
  const members = data?.members ?? [];
  const boardName = data?.board.name ?? "";

  const overflowItems = [
    { label: "Invite people", onSelect: invite },
    { label: "Toggle theme", onSelect: toggleTheme },
    { label: dir === "rtl" ? "Left-to-right layout" : "Right-to-left layout", onSelect: toggleDir },
    { label: "All boards", onSelect: () => navigate("/boards") },
  ];

  return (
    <div className="page">
      <div className={styles.desktopOnly}>
        <AppHeader workspaceName={data?.workspaceName} />
      </div>
      <div className={styles.mobileBar}>
        <Link to="/boards" aria-label="Back to boards" className={styles.back}>
          <span className="mirror-rtl" aria-hidden="true">
            ‹
          </span>
        </Link>
        <h1>{boardName}</h1>
        <Menu label="Board actions" items={overflowItems} />
      </div>

      <main className={styles.main}>
        <div className={styles.top}>
          <div className={styles.titleBlock}>
            <p className={`${styles.crumb} muted`}>
              <Link to="/boards">Boards</Link> / {boardName || " "}
            </p>
            <h1 className={styles.title}>{boardName || " "}</h1>
          </div>
          <div className={styles.actions}>
            <AvatarStack users={members} />
            <AppButton onClick={invite}>Invite</AppButton>
            <AppButton variant="primary" onClick={() => setModal({ type: "new", status: "todo" })} disabled={phase !== "ready"}>
              New task
            </AppButton>
          </div>
        </div>

        <div className={styles.filters} role="search">
          <div className={styles.search}>
            <label htmlFor="task-search" className="sr-only">
              Search tasks
            </label>
            <input id="task-search" type="search" placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className={styles.chips}>
            <div className={styles.chip}>
              <Dropdown options={[ANY_ASSIGNEE, ...members.map((m) => m.name)]} Value={assignee} OnChange={setAssignee} />
            </div>
            <div className={styles.chip}>
              <Dropdown options={[ANY_LABEL, ...LABELS]} Value={label} OnChange={setLabel} />
            </div>
            <div className={styles.chip}>
              <Dropdown options={DATE_OPTIONS} Value={date} OnChange={setDate} />
            </div>
            {filtering && (
              <AppButton
                variant="text"
                onClick={() => {
                  setQuery("");
                  setAssignee(ANY_ASSIGNEE);
                  setLabel(ANY_LABEL);
                  setDate(ANY_DATE);
                }}
              >
                Clear
              </AppButton>
            )}
          </div>
          <p className={`${styles.count} muted`} aria-live="polite">
            {phase === "ready" ? <bdi>{filtering ? `${visible.length} of ${plural(total, "task")}` : plural(total, "task")}</bdi> : " "}
          </p>
        </div>
        {filtering && <p className={`${styles.hint} muted`}>Reordering is paused while filters are on.</p>}

        <div className={styles.tabs} role="tablist" aria-label="Columns">
          {STATUSES.map((s) => (
            <button key={s.id} role="tab" aria-selected={tab === s.id} className={styles.tab} onClick={() => setTab(s.id)}>
              {s.name} {phase === "ready" ? byStatus(s.id).length : ""}
            </button>
          ))}
        </div>

        <div className={styles.columns}>
          {STATUSES.map((s) => {
            const tasks = byStatus(s.id);
            const showSlot = drag && drag.overStatus === s.id;
            const cards = tasks.filter((t) => t.id !== drag?.taskId);
            const slotAt = showSlot ? Math.min(drag.overIndex, cards.length) : -1;
            const nodes: React.ReactNode[] = [];
            const renderCard = (t: Task) => (
              <TaskCard
                key={t.id}
                task={t}
                assignee={userById.get(t.assigneeId ?? "")}
                draggable={dragEnabled}
                isDragging={drag?.taskId === t.id}
                onOpen={() => openTaskModal(t.id)}
                onMove={(status) => void board.updateTask(t.id, { status })}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", t.id);
                  setDrag({ taskId: t.id, overStatus: null, overIndex: 0 });
                }}
                onDragEnd={() => setDrag(null)}
              />
            );
            tasks.forEach((t) => {
              if (t.id === drag?.taskId) return nodes.push(renderCard(t));
              const i = cards.indexOf(t);
              if (i === slotAt) nodes.push(<div key="slot" className={styles.slot} aria-hidden="true" />);
              nodes.push(renderCard(t));
            });
            if (slotAt === cards.length) nodes.push(<div key="slot" className={styles.slot} aria-hidden="true" />);

            return (
              <Column
                key={s.id}
                name={s.name}
                count={tasks.length}
                state={columnState(s.id)}
                active={tab === s.id}
                isDropTarget={!!showSlot}
                skeletons={SKELETONS[s.id]}
                onAdd={() => setModal({ type: "new", status: s.id })}
                onRetry={board.reload}
                onDragOver={(e) => onColumnDragOver(s.id, e)}
                onDragLeave={onColumnDragLeave}
                onDrop={(e) => onColumnDrop(s.id, e)}
              >
                {nodes}
              </Column>
            );
          })}
        </div>
      </main>

      <div className={styles.mobileNew}>
        <AppButton variant="primary" block onClick={() => setModal({ type: "new", status: tab })} disabled={phase !== "ready"}>
          New task
        </AppButton>
      </div>

      {notice && (
        <div className={styles.notice} role="status">
          {notice}
        </div>
      )}

      {modal?.type === "new" && data && (
        <TaskFormModal
          members={members}
          defaultStatus={modal.status}
          currentUserId={user.id}
          onClose={() => setModal(null)}
          onSubmit={async (input) => {
            await board.createTask(input, user.id);
          }}
        />
      )}
      {editing && data && (
        <TaskFormModal
          members={members}
          task={editing}
          currentUserId={user.id}
          onClose={() => setModal(null)}
          onSubmit={async (input) => {
            await board.updateTask(editing.id, input);
          }}
        />
      )}
      {openTask && !modal && data && (
        <TaskDetailModal
          task={openTask}
          members={members}
          users={(id) => userById.get(id) ?? (id === user.id ? user : undefined)}
          currentUserId={user.id}
          onClose={closeTask}
          onEdit={() => {
            setModal({ type: "edit", taskId: openTask.id });
            closeTask();
          }}
          onUpdate={(patch) => void board.updateTask(openTask.id, patch)}
          onDelete={() => {
            closeTask();
            void board.deleteTask(openTask.id);
          }}
          onComment={(body) => board.addComment(openTask.id, user.id, body)}
        />
      )}
      <ScrollGuard active={!!drag} />
    </div>
  );
}

function ScrollGuard({ active }: { active: boolean }) {
  const raf = useRef(0);
  useEffect(() => {
    if (!active) return;
    let y = 0;
    const onOver = (e: globalThis.DragEvent) => {
      y = e.clientY;
    };
    const tick = () => {
      const edge = 70;
      if (y > 0 && y < edge) window.scrollBy(0, -12);
      else if (y > window.innerHeight - edge) window.scrollBy(0, 12);
      raf.current = requestAnimationFrame(tick);
    };
    document.addEventListener("dragover", onOver);
    raf.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("dragover", onOver);
      cancelAnimationFrame(raf.current);
    };
  }, [active]);
  return null;
}
