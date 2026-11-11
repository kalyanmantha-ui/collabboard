import { useState, type FormEvent } from "react";
import { Modal, Input } from "paper-ui";
import { AppButton } from "./AppButton";
import { Textarea } from "./Field";
import dlg from "./dialog.module.css";

export function NameDialog({
  title,
  submitLabel,
  withDescription,
  onClose,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  withDescription?: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onSubmit(name, description);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={submit} className={dlg.form}>
        <header className={dlg.head}>
          <h2>{title}</h2>
          <AppButton variant="icon" onClick={onClose} aria-label="Close">
            ×
          </AppButton>
        </header>
        <div className={dlg.body}>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          {withDescription && <Textarea label="Description" value={description} onChange={setDescription} placeholder="What is this board for?" />}
        </div>
        <footer className={dlg.foot}>
          <span />
          <div className={dlg.actions}>
            <AppButton onClick={onClose}>Cancel</AppButton>
            <AppButton variant="primary" type="submit" isLoading={busy} disabled={!name.trim()}>
              {submitLabel}
            </AppButton>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
