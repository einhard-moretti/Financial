"use client";

import { Wallet, Plus, Download, Trash2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLast12Months, getMonthLabel } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  monthKey: string;
  onMonthChange: (key: string) => void;
  onAddClick: () => void;
  onExportClick: () => void;
  onShowShortcuts: () => void;
  totalTransactions: number;
}

export function Header({
  monthKey,
  onMonthChange,
  onAddClick,
  onExportClick,
  onShowShortcuts,
  totalTransactions,
}: HeaderProps) {
  const months = getLast12Months();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 glow-gold">
              <Wallet className="h-5 w-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  Einhard <span className="text-gold">Financial</span>
                </h1>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex border-amber-400/40 text-gold text-[10px] font-medium uppercase tracking-wider"
                >
                  Road to Financial Freedom
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Never lost money — {totalTransactions} transactions.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={monthKey} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[160px] bg-card border-border">
                <span className="text-muted-foreground text-xs mr-1">Period</span>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((mk) => (
                  <SelectItem key={mk} value={mk}>
                    {getMonthLabel(mk)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={onShowShortcuts}
              title="Keyboard shortcuts"
              className="bg-card hover:bg-accent"
            >
              <Keyboard className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onExportClick}
              className="bg-card hover:bg-accent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>

            <Button
              size="sm"
              onClick={onAddClick}
              className="bg-gold text-primary-foreground hover:bg-amber-300 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
