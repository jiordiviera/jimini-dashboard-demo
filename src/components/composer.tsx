"use client";

import {
  ArrowUpIcon,
  BoltIcon,
  BookOpenIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  MicrophoneIcon,
  PaperClipIcon,
  StopIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import { JiminiLoader } from "@/components/jimini-loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSpeechDictation } from "@/hooks/use-speech-dictation";
import { extractDocuments } from "@/lib/chat-client";
import { ACCEPT_ATTR, MAX_FILES } from "@/lib/chat-protocol";
import { CHIP_TEMPLATES, MORE_TEMPLATES } from "@/lib/prompts";
import type { ChatDocument, ChatMode, ComposerSubmit } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

export const DEFAULT_PLACEHOLDER =
  "Identifie les clauses abusives dans ce contrat de bail commercial";

const MODE_ITEMS = [
  { value: "rapide", label: "Rapide" },
  { value: "reflexion", label: "Réflexion" },
];

interface ComposerProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (input: ComposerSubmit) => void;
  streaming?: boolean;
  onStop?: () => void;
  defaultMode?: ChatMode;
  defaultSources?: boolean;
  placeholder?: string;
  variant?: "hero" | "compact";
  focusSignal?: number;
  existingDocCount?: number;
  autoFocus?: boolean;
}

const toolButton =
  "inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-jm-ink-3 transition-colors outline-none hover:bg-jm-chip hover:text-jm-ink focus-visible:ring-2 focus-visible:ring-jm-blue/30 disabled:opacity-50";

export function Composer({
  value,
  onValueChange,
  onSubmit,
  streaming = false,
  onStop,
  defaultMode = "reflexion",
  defaultSources = false,
  placeholder = DEFAULT_PLACEHOLDER,
  variant = "hero",
  focusSignal = 0,
  existingDocCount = 0,
  autoFocus = false,
}: ComposerProps) {
  const [mode, setMode] = useState<ChatMode>(defaultMode);
  const [sources, setSources] = useState(defaultSources);
  const [documents, setDocuments] = useState<ChatDocument[]>([]);
  const [uploading, setUploading] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const dictation = useSpeechDictation((text) => {
    const current = valueRef.current;
    onValueChange(current ? `${current.trimEnd()} ${text}` : text);
  });

  useEffect(() => {
    if (dictation.error) toast.error(dictation.error);
  }, [dictation.error]);

  useEffect(() => {
    if (focusSignal === 0) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, [focusSignal]);

  const hasText = value.trim().length > 0;
  const busyUploading = uploading.length > 0;
  const canSend = hasText && !streaming && !busyUploading;

  const addFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    const already = existingDocCount + documents.length;
    if (already >= MAX_FILES) {
      toast.error(`${MAX_FILES} fichiers maximum par conversation.`);
      return;
    }
    setUploading((prev) => [...prev, ...files.map((f) => f.name)]);
    const { documents: extracted, errors } = await extractDocuments(files, already);
    setUploading((prev) => prev.filter((name) => !files.some((f) => f.name === name)));
    if (extracted.length > 0) {
      setDocuments((prev) => [...prev, ...extracted].slice(0, MAX_FILES - existingDocCount));
      toast.success(
        extracted.length === 1
          ? `${extracted[0].name} ajouté`
          : `${extracted.length} documents ajoutés`,
      );
    }
    errors.forEach((message) => toast.error(message));
  };

  const submit = () => {
    if (!canSend) return;
    if (dictation.listening) dictation.stop();
    onSubmit({ text: value.trim(), documents, mode, sources });
    setDocuments([]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    setDragging(true);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    void addFiles(event.dataTransfer.files);
  };

  const insertTemplate = (prompt: string) => {
    onValueChange(prompt);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(prompt.length, prompt.length);
    });
  };

  const hero = variant === "hero";

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={onDrop}
      className={cn(
        "relative rounded-[22px] border border-jm-border bg-white transition-[border-color,box-shadow] focus-within:border-jm-focus-border",
        "shadow-[0_1px_2px_rgba(31,35,48,0.04),0_12px_32px_-16px_rgba(31,35,48,0.14)] focus-within:shadow-[0_1px_2px_rgba(31,35,48,0.04),0_0_0_4px_rgba(76,99,230,0.07),0_12px_32px_-16px_rgba(31,35,48,0.16)]",
        dragging && "border-jm-blue ring-4 ring-jm-blue/10",
      )}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-jm-drop/95 text-[14px] font-medium text-jm-blue">
          <PaperClipIcon className="mr-2 size-5" /> Déposez vos fichiers (PDF, TXT, MD, CSV)
        </div>
      )}

      {(documents.length > 0 || busyUploading) && (
        <div className="flex flex-wrap gap-2 px-4 pt-3.5">
          {documents.map((doc) => (
            <span
              key={doc.id}
              className="inline-flex max-w-[260px] items-center gap-2 rounded-xl border border-jm-border bg-jm-surface py-1.5 pr-1.5 pl-2 text-[12.5px]"
            >
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-jm-rose-soft text-jm-rose">
                <DocumentTextIcon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-jm-ink">{doc.name}</span>
                <span className="block text-[11px] text-jm-muted">
                  {doc.pages !== null
                    ? `${doc.pages} page${doc.pages > 1 ? "s" : ""}`
                    : formatBytes(doc.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Retirer ${doc.name}`}
                onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-jm-muted hover:bg-jm-hover hover:text-jm-ink"
              >
                <XMarkIcon className="size-3.5 stroke-2" />
              </button>
            </span>
          ))}
          {uploading.map((name) => (
            <span
              key={name}
              className="inline-flex max-w-[260px] items-center gap-2 rounded-xl border border-dashed border-jm-border-accent py-1.5 pr-3 pl-2 text-[12.5px] text-jm-muted"
            >
              <JiminiLoader size="sm" />
              <span className="truncate">{name}</span>
            </span>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label="Votre demande"
        rows={hero ? 2 : 1}
        className={cn(
          "jm-thin-scroll block field-sizing-content w-full resize-none bg-transparent px-5 text-[15px] leading-relaxed text-jm-ink outline-none placeholder:text-jm-placeholder",
          hero ? "min-h-[84px] pt-4 pb-2" : "min-h-[52px] pt-3.5 pb-1",
          "max-h-[260px] overflow-y-auto",
        )}
      />

      <div className="flex items-center justify-between gap-2 px-2.5 pt-1 pb-2.5 sm:px-3">
        <div className="flex min-w-0 items-center gap-0.5">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className={toolButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={busyUploading}
          >
            <PaperClipIcon className="size-[18px]" />
            <span className="hidden sm:inline">Joindre</span>
          </button>
          <button
            type="button"
            aria-pressed={sources}
            onClick={() => setSources((s) => !s)}
            className={cn(
              toolButton,
              sources && "bg-jm-soft text-jm-blue hover:bg-jm-soft-hover hover:text-jm-blue",
            )}
          >
            <BookOpenIcon className="size-[18px]" />
            <span className="hidden sm:inline">Sources</span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Actions rapides"
              className={cn(toolButton, "w-8 justify-center px-0 data-popup-open:bg-jm-chip")}
            >
              <BoltIcon className="size-[18px]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-xl p-1.5">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions rapides</DropdownMenuLabel>
                {[...CHIP_TEMPLATES, ...MORE_TEMPLATES].map((t) => (
                  <DropdownMenuItem key={t.id} onClick={() => insertTemplate(t.prompt)}>
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Plus d'options"
              className={cn(toolButton, "w-8 justify-center px-0 data-popup-open:bg-jm-chip")}
            >
              <EllipsisHorizontalIcon className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-xl p-1.5">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <PaperClipIcon /> Joindre des fichiers
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!value} onClick={() => onValueChange("")}>
                <XMarkIcon /> Effacer le texte
              </DropdownMenuItem>
              <DropdownMenuItem disabled={documents.length === 0} onClick={() => setDocuments([])}>
                <TrashIcon /> Retirer les pièces jointes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-[12px] leading-relaxed text-jm-muted">
                Entrée pour envoyer · Maj + Entrée pour un saut de ligne. Jusqu&apos;à {MAX_FILES}{" "}
                fichiers de 8 Mo.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Select
            items={MODE_ITEMS}
            value={mode}
            onValueChange={(next) => {
              if (next === "rapide" || next === "reflexion") setMode(next);
            }}
          >
            <SelectTrigger
              aria-label="Mode de réponse"
              className="h-8 rounded-lg border-0 bg-transparent px-2 text-[13px] font-medium text-jm-ink-3 shadow-none hover:bg-jm-chip focus-visible:ring-2 focus-visible:ring-jm-blue/30"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="end" className="rounded-xl">
              {MODE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Arrêter la génération"
              className="inline-flex size-9 items-center justify-center rounded-full bg-jm-ink text-white transition-transform hover:scale-105"
            >
              <StopIcon className="size-4 fill-white" />
            </button>
          ) : hasText ? (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Envoyer"
              className="inline-flex size-9 items-center justify-center rounded-full bg-jm-blue text-white shadow-[0_4px_12px_-4px_rgba(76,99,230,0.7)] transition-[transform,background-color] hover:scale-105 hover:bg-jm-blue-hover disabled:opacity-60 disabled:hover:scale-100"
            >
              <ArrowUpIcon className="size-[18px] stroke-[2.25]" />
            </button>
          ) : (
            <MicButton
              supported={dictation.supported}
              listening={dictation.listening}
              onToggle={dictation.listening ? dictation.stop : dictation.start}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MicButton({
  supported,
  listening,
  onToggle,
}: {
  supported: boolean;
  listening: boolean;
  onToggle: () => void;
}) {
  const className = cn(
    "inline-flex size-9 items-center justify-center rounded-full bg-jm-blue text-white shadow-[0_4px_12px_-4px_rgba(76,99,230,0.7)] transition-[transform,background-color] hover:bg-jm-blue-hover",
    listening && "animate-pulse bg-jm-rec shadow-[0_0_0_6px_rgba(224,71,92,0.15)] hover:bg-jm-rec-hover",
  );

  if (!supported) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span tabIndex={0} className="inline-flex rounded-full" />}>
          <button
            type="button"
            disabled
            aria-label="Dictée indisponible"
            className={cn(className, "cursor-not-allowed opacity-45 hover:bg-jm-blue")}
          >
            <MicrophoneIcon className="size-[18px]" />
          </button>
        </TooltipTrigger>
        <TooltipContent>La dictée vocale n&apos;est pas prise en charge par ce navigateur</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onToggle}
        aria-label={listening ? "Arrêter la dictée" : "Dicter"}
        aria-pressed={listening}
        className={className}
      >
        <MicrophoneIcon className="size-[18px]" />
      </TooltipTrigger>
      <TooltipContent>{listening ? "Arrêter la dictée" : "Dicter (français)"}</TooltipContent>
    </Tooltip>
  );
}
