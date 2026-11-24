"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface TextPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel: string;
  onConfirm: (value: string) => void;
}

function TextPromptForm({
  label,
  placeholder,
  initialValue = "",
  confirmLabel,
  onConfirm,
  onCancel,
}: Pick<
  TextPromptDialogProps,
  "label" | "placeholder" | "initialValue" | "confirmLabel" | "onConfirm"
> & { onCancel: () => void }) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-1.5 text-[13px] font-medium text-jm-ink">
        {label}
        <Input
          autoFocus
          value={value}
          maxLength={120}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 rounded-xl bg-white text-[14px]"
        />
      </label>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">
          Annuler
        </Button>
        <Button type="submit" disabled={!trimmed} className="rounded-xl">
          {confirmLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TextPromptDialog({
  open,
  onOpenChange,
  title,
  description,
  ...form
}: TextPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[17px]">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {open && (
          <TextPromptForm
            key={form.initialValue}
            {...form}
            onCancel={() => onOpenChange(false)}
            onConfirm={(value) => {
              form.onConfirm(value);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
