import { useState, type FormEvent } from "react";
import { Input, Modal } from "paper-ui";
import { AppButton } from "../../components/AppButton";
import { Select, Textarea } from "../../components/Field";
import { LABELS, STATUSES, type Label, type NewTaskInput, type Status, type Task, type User } from "../../types";
import dlg from "../../components/dialog.module.css";

const UNASSIGNED = "none";

interface Props {
  members: User[];
  task?: Task;
  defaultStatus?: Status;
  currentUserId: string;
  onClose: () => void;
  onSubmit: (input: NewTaskInput) => Promise<void>;
}

export function TaskFormModal({ members, task, defaultStatus = "todo", currentUserId, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<Status>(task?.status ?? defaultStatus);
  const [assignee, setAssignee] = useState<string>(task ? (task.assigneeId ?? UNASSIGNED) : (members.find((m) => m.id === currentUserId)?.id ?? UNASSIGNED));
  const [label, setLabel] = useState<Label>(task?.label ?? "Feature");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await onSubmit({ title, description, status, assigneeId: assignee === UNASSIGNED ? null : assignee, label, dueDate: dueDate || null });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={submit} className={dlg.form}>
        <header className={dlg.head}>
          <h2>{task ? "Edit task" : "New task"}</h2>
          <AppButton variant="icon" onClick={onClose} aria-label="Close">
            ×
          </AppButton>
        </header>
        <div className={dlg.body}>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} autoComplete="off" placeholder="Write API contract types" />
          <Textarea label="Description" value={description} onChange={setDescription} placeholder="What needs to happen, and what done looks like" />
          <div className={dlg.grid2}>
            <Select label="Status" value={status} options={STATUSES} onChange={setStatus} />
            <Select label="Assignee" value={assignee} options={[...members.map((m) => ({ id: m.id, name: m.name })), { id: UNASSIGNED, name: "Unassigned" }]} onChange={setAssignee} />
            <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Select label="Label" value={label} options={LABELS.map((l) => ({ id: l, name: l }))} onChange={setLabel} />
          </div>
        </div>
        <footer className={dlg.foot}>
          <span />
          <div className={dlg.actions}>
            <AppButton onClick={onClose}>Cancel</AppButton>
            <AppButton variant="primary" type="submit" isLoading={busy} disabled={!title.trim()}>
              {task ? "Save changes" : "Create task"}
            </AppButton>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
