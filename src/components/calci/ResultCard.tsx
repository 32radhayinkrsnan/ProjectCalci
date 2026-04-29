import { Sparkles } from "lucide-react";

interface Props {
  cgpa: number;
  percentage: number;
  totalCredits: number;
}

export function ResultCard({ cgpa, percentage, totalCredits }: Props) {
  const hasResult = totalCredits > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-elegant animate-scale-in">
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-2 text-sm font-medium opacity-90">
          <Sparkles className="h-4 w-4" />
          Your Result
        </div>

        <div className="mt-4 flex items-end gap-3">
          <span className="text-7xl font-bold tracking-tight tabular-nums">
            {hasResult ? cgpa.toFixed(2) : "—"}
          </span>
          <span className="pb-3 text-lg font-medium opacity-80">CGPA</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
            <p className="text-xs uppercase tracking-wider opacity-80">
              Percentage
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {hasResult ? `${percentage.toFixed(2)}%` : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
            <p className="text-xs uppercase tracking-wider opacity-80">
              Credits
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {hasResult ? totalCredits : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}