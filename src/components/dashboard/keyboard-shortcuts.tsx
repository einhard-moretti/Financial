"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Add new transaction" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["1"], description: "Monthly tab (transactions)" },
  { keys: ["2"], description: "Balance Sheet tab" },
  { keys: ["3"], description: "Invoice tab" },
  { keys: ["4"], description: "Account tab" },
  { keys: ["5"], description: "Contact tab" },
  { keys: ["6"], description: "Trash tab" },
  { keys: ["Esc"], description: "Close dialog/modal" },
];

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-gold" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Speed up your workflow — all transactions are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          {SHORTCUTS.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
            >
              <span className="text-sm text-foreground">{s.description}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded border border-border bg-muted text-[11px] font-mono text-foreground"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
