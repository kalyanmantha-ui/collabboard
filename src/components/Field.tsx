import { useId, type ReactNode } from "react";
import { Dropdown } from "paper-ui";

export function Textarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: { id: T; name: string }[];
  onChange: (id: T) => void;
}) {
  const current = options.find((o) => o.id === value)?.name;
  return (
    <div className="field">
      <span className="label">{label}</span>
      <Dropdown
        options={options.map((o) => o.name)}
        Value={current}
        OnChange={(name) => {
          const hit = options.find((o) => o.name === name);
          if (hit) onChange(hit.id);
        }}
      />
    </div>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="field-row">{children}</div>;
}
