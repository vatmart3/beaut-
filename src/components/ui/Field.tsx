"use client";

import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons/Icon";

/**
 * Primitives de formulaire BRUME. Libellé toujours visible, erreur reliée par
 * aria-describedby, cible tactile ≥ 48 px, focus visible.
 */

const control =
  "peer block w-full rounded-[var(--radius-soft)] border border-prune/20 bg-ecume px-4 py-3 text-[1rem] text-prune placeholder:text-prune-mute/80 transition-[border-color,box-shadow,background-color] duration-[var(--dur-2)] ease-[var(--ease-veil)] hover:border-prune/40 focus:border-prune focus:outline-none focus:ring-4 focus:ring-argile/25 aria-[invalid=true]:border-[#9b3b3b] aria-[invalid=true]:ring-[#9b3b3b]/10";

export function FieldShell({ label, hint, error, id, children, optional }: { label: string; hint?: string; error?: string; id: string; children: ReactNode; optional?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="font-display text-[0.9rem] text-prune">
        {label}
        {optional ? <span className="ml-1.5 text-prune-mute">(facultatif)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-prune-mute">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-error`} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  return (
    <p id={id} role={error ? "alert" : undefined} className={cn("flex items-center gap-1.5 text-[0.8125rem] text-[#8f2f2f]", !error && "sr-only")}>
      {error ? (
        <>
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-current" />
          {error}
        </>
      ) : null}
    </p>
  );
}

type InputProps = ComponentProps<"input"> & { label: string; hint?: string; error?: string; optional?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, hint, error, optional, className, id, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} id={fid} optional={optional}>
      <input
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={cn(control, "min-h-12", className)}
        {...rest}
      />
    </FieldShell>
  );
});

type TextareaProps = ComponentProps<"textarea"> & { label: string; hint?: string; error?: string; optional?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hint, error, optional, className, id, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} id={fid} optional={optional}>
      <textarea
        ref={ref}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={cn(control, "min-h-28 resize-y", className)}
        {...rest}
      />
    </FieldShell>
  );
});

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode; error?: string };

/** Case à cocher ronde (galet), libellé cliquable sur toute la ligne. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, error, className, id, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={className}>
      <label htmlFor={fid} className="group flex min-h-11 cursor-pointer items-start gap-3 py-1.5">
        <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
          <input
            ref={ref}
            id={fid}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fid}-error` : undefined}
            className="peer absolute inset-0 size-6 cursor-pointer appearance-none rounded-[45%_55%_50%_50%] border border-prune/35 bg-ecume transition-colors checked:border-prune checked:bg-prune focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-prune"
            {...rest}
          />
          <Icon name="check" size={16} strokeWidth={1.8} className="pointer-events-none relative text-lait opacity-0 transition-opacity peer-checked:opacity-100" />
        </span>
        <span className="text-[0.95rem] leading-snug">{label}</span>
      </label>
      <FieldError id={`${fid}-error`} error={error} />
    </div>
  );
});

/** Option visuelle (carte-galet) pour les choix : radio stylée. */
export function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  children,
  className,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex min-h-12 cursor-pointer items-center rounded-[var(--radius-soft)] border px-4 py-3 transition-[border-color,background-color,box-shadow,transform] duration-[var(--dur-2)] ease-[var(--ease-veil)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-argile/35",
        checked ? "border-prune bg-prune text-lait shadow-[var(--shadow-veil)]" : "border-prune/15 bg-ecume hover:border-prune/40",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
    >
      <input id={id} type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={() => onChange(value)} className="sr-only" />
      {children}
    </label>
  );
}
