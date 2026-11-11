import type { ComponentProps } from "react";
import { Button } from "paper-ui";

type Variant = "primary" | "secondary" | "text" | "destructive" | "dashed" | "icon";

interface Props extends Omit<ComponentProps<"button">, "className"> {
  variant?: Variant;
  block?: boolean;
  isLoading?: boolean;
}

export function AppButton({ variant = "secondary", block, isLoading, children, type = "button", ...rest }: Props) {
  if (variant === "primary") {
    return (
      <span className={`primary-slot${block ? " block" : ""}`}>
        <Button type={type} isLoading={isLoading} {...rest}>
          {children}
        </Button>
      </span>
    );
  }
  const cls = ["btn", variant !== "secondary" && variant, block && "block"].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} aria-busy={isLoading || undefined} {...rest} disabled={isLoading || rest.disabled}>
      {children}
    </button>
  );
}
