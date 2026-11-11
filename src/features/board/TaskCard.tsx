import type { DragEvent } from "react";
import { Avatar } from "../../components/Avatar";
import { Menu } from "../../components/Menu";
import { Tag } from "../../components/Tag";
import { plural, shortDate } from "../../lib/format";
import { STATUSES, type Status, type Task, type User } from "../../types";
import styles from "./TaskCard.module.css";

interface Props {
  task: Task;
  assignee: User | undefined;
  draggable: boolean;
  isDragging: boolean;
  onOpen: () => void;
  onMove: (status: Status) => void;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

export function TaskCard({ task, assignee, draggable, isDragging, onOpen, onMove, onDragStart, onDragEnd }: Props) {
  const overdue = task.status !== "done" && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10);
  return (
    <article
      className={styles.card}
      data-card
      data-dragging={isDragging}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Tag label={task.label} />
      <button className={styles.title} onClick={onOpen}>
        {task.title}
      </button>
      <div className={styles.meta}>
        <span className={`${styles.info} muted`}>
          {task.status === "done" && task.completedAt ? (
            <bdi>Done {shortDate(task.completedAt)}</bdi>
          ) : task.dueDate ? (
            <bdi className={overdue ? styles.overdue : undefined}>Due {shortDate(task.dueDate)}</bdi>
          ) : null}
          {task.comments.length > 0 && <bdi>{plural(task.comments.length, "comment")}</bdi>}
        </span>
        <Avatar user={assignee} />
      </div>
      <Menu
        className={styles.menu}
        label={`Actions for ${task.title}`}
        items={[
          { label: "Open", onSelect: onOpen },
          ...STATUSES.filter((s) => s.id !== task.status).map((s) => ({ label: `Move to ${s.name}`, onSelect: () => onMove(s.id) })),
        ]}
      />
    </article>
  );
}
