"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { TrendPoint, formatIDR } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";

interface TrendChartProps {
  data: TrendPoint[] | undefined;
  isLoading: boolean;
}

export function TrendChart({ data, isLoading }: TrendChartProps) {
  if (isLoading || !data) {
    return <Skeleton className="h-64 rounded-xl bg-card" />;
  }

  return (
    <Card className="border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-gold" />
            Last 12 Months Trend
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Monthly income vs expenses
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Expense</span>
          </div>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.70 0.18 145)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.70 0.18 145)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.62 0.22 25)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="oklch(0.62 0.22 25)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 270)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="oklch(0.62 0.01 270)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.62 0.01 270)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatIDR(Number(v), { compact: true }).replace("Rp ", "")}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.11 0.005 270)",
                border: "1px solid oklch(0.22 0.005 270)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "oklch(0.98 0.005 90)", marginBottom: "4px", fontWeight: 600 }}
              formatter={(value: number, name: string) => {
                const label = name === "income" ? "Income" : name === "expense" ? "Expense" : "Net";
                const color = name === "income" ? "oklch(0.75 0.18 145)" : name === "expense" ? "oklch(0.68 0.22 25)" : "oklch(0.82 0.15 75)";
                return (
                  <span style={{ color }}>
                    {label}: {formatIDR(Number(value))}
                  </span>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="oklch(0.70 0.18 145)"
              strokeWidth={2}
              fill="url(#incomeGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "oklch(0.75 0.18 145)" }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="oklch(0.62 0.22 25)"
              strokeWidth={2}
              fill="url(#expenseGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "oklch(0.68 0.22 25)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
