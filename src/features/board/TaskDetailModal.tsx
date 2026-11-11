import { useState, type FormEvent } from "react";
import { Modal } from "paper-ui";
import { Avatar } from "../../components/Avatar";
import { AppButton } from "../../components/AppButton";
import { Select, Textarea } from "../../components/Field";
import { Tag } from "../../components/Tag";
import { dateTime, longDate, shortDate } from "../../lib/format";
import { STATUSES, type Status, type Task, type TaskPatch, type User } from "../../types";
import styles from "./TaskDetailModal.module.css";

const UNASSIGNED = "none";

interface Props {
  task: Task;
  members: User[];
  users: (id: string) => User | undefined;
  currentUserId: string;
  onClose: () => void;
  onEdit: () => void;
  onUpdate: (patch: TaskPatch) => void;
  onDelete: () => void;
  onComment: (body: string) => Promise<void>;
}

export function TaskDetailModal({ task, members, users, currentUserId, onClose, onEdit, onUpdate, onDelete, onComment }: Props) {
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const creator = users(task.createdBy);

  async function postComment(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      await onComment(body);
      setBody("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} className={styles.wide}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <Tag label={task.label} />
          <h2>{task.title}</h2>
        </div>
        <AppButton variant="icon" onClick={onClose} aria-label="Close">
          ×
        </AppButton>
      </header>

      <div className={styles.body}>
        <div className={styles.main}>
          <div>
            <p className={styles.sectionLabel}>Description</p>
            <p className={styles.desc}>{task.description ? <bdi>{task.description}</bdi> : <span className="muted">No description yet.</span>}</p>
          </div>

          <div>
            <p className={styles.sectionLabel}>Comments, {task.comments.length}</p>
            <ul className={styles.comments}>
              {task.comments.map((c) => (
                <li key={c.id} className={styles.comment}>
                  <Avatar user={users(c.authorId)} size={32} />
                  <div>
                    <p className={styles.commentHead}>
                      <strong>{users(c.authorId)?.name ?? "Unknown"}</strong> <bdi className="muted">{dateTime(c.createdAt)}</bdi>
                    </p>
                    <p className={styles.commentBody}><bdi>{c.body}</bdi></p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={postComment} className={styles.commentForm}>
            <Textarea label="Add a comment" value={body} onChange={setBody} placeholder="Write a comment" />
            <div className={styles.commentActions}>
              <AppButton variant="primary" type="submit" isLoading={posting} disabled={!body.trim()}>
                Comment
              </AppButton>
            </div>
          </form>
        </div>

        <aside className={styles.side}>
          <Select label="Status" value={task.status} options={STATUSES} onChange={(s: Status) => onUpdate({ status: s })} />
          <Select
            label="Assignee"
            value={task.assigneeId ?? UNASSIGNED}
            options={[...members.map((m) => ({ id: m.id, name: m.name })), { id: UNASSIGNED, name: "Unassigned" }]}
            onChange={(id) => onUpdate({ assigneeId: id === UNASSIGNED ? null : id })}
          />
          <div>
            <p className={styles.sectionLabel}>Due date</p>
            <p className={styles.value}>{task.dueDate ? longDate(task.dueDate) : "None"}</p>
          </div>
          <div>
            <p className={styles.sectionLabel}>Created</p>
            <p className={styles.value}>
              <bdi>{shortDate(task.createdAt.slice(0, 10))} by {creator?.name ?? users(currentUserId)?.name}</bdi>
            </p>
          </div>
        </aside>
      </div>

      <footer className={styles.foot}>
        {confirming ? (
          <div className={styles.confirm} role="alertdialog" aria-label="Confirm delete">
            <span>Delete this task?</span>
            <AppButton onClick={() => setConfirming(false)}>Keep</AppButton>
            <AppButton variant="destructive" onClick={onDelete}>
              Yes, delete
            </AppButton>
          </div>
        ) : (
          <AppButton variant="destructive" onClick={() => setConfirming(true)}>
            Delete task
          </AppButton>
        )}
        <AppButton onClick={onEdit}>Edit task</AppButton>
      </footer>
    </Modal>
  );
}
