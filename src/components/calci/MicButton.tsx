import { Mic, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export type MicState = "idle" | "listening" | "processing";

interface MicButtonProps {
  state: MicState;
  onClick: () => void;
  supported: boolean;
}

const labelMap: Record<MicState, string> = {
  idle: "Tap to speak",
  listening: "Listening...",
  processing: "Converting speech...",
};

export function MicButton({ state, onClick, supported }: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-5 animate-fade-in">
      <div className="relative">
        {state === "listening" && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
            <span
              className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring"
              style={{ animationDelay: "0.6s" }}
            />
          </>
        )}
        <button
          onClick={onClick}
          disabled={!supported || state === "processing"}
          aria-label={labelMap[state]}
          className={cn(
            "relative h-32 w-32 rounded-full flex items-center justify-center",
            "bg-gradient-primary text-primary-foreground shadow-elegant",
            "transition-smooth hover:scale-105 active:scale-95",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            state === "listening" && "shadow-glow"
          )}
        >
          {state === "processing" ? (
            <Loader2 className="h-12 w-12 animate-spin" />
          ) : state === "listening" ? (
            <Square className="h-10 w-10 fill-current" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
        </button>
      </div>
      <p className="text-base font-medium text-foreground">
        {supported ? labelMap[state] : "Voice not supported in this browser"}
      </p>
    </div>
  );
}