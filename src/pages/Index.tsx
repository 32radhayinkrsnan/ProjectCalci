import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, Quote } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MicButton, MicState } from "@/components/calci/MicButton";
import { SubjectsTable } from "@/components/calci/SubjectsTable";
import { ResultCard } from "@/components/calci/ResultCard";
import { UploadMarksheet } from "@/components/calci/UploadMarksheet";
import {
  calculateCGPA,
  parseTranscript,
  Subject,
} from "@/lib/calci/grades";
import { getSpeechRecognition, isSpeechSupported } from "@/lib/calci/speech";

const Index = () => {
  const [micState, setMicState] = useState<MicState>("idle");
  const [transcript, setTranscript] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const recognitionRef = useRef<any>(null);
  const supported = isSpeechSupported();

  const result = useMemo(() => calculateCGPA(subjects), [subjects]);

  useEffect(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onerror = (e: any) => {
      setMicState("idle");
      toast({
        title: "Mic error",
        description: e.error || "Couldn't capture audio.",
        variant: "destructive",
      });
    };
    rec.onend = () => {
      setMicState((prev) => {
        if (prev === "listening") {
          // move to processing then parse
          setTimeout(() => {
            setTranscript((t) => {
              const parsed = parseTranscript(t);
              if (parsed.length) {
                setSubjects((curr) => [...curr, ...parsed]);
                toast({
                  title: `Added ${parsed.length} subject${parsed.length > 1 ? "s" : ""}`,
                });
              } else if (t.trim()) {
                toast({
                  title: "Couldn't parse",
                  description: "Try: Math 4 credits A, Physics 3 credits B+",
                  variant: "destructive",
                });
              }
              return t;
            });
            setMicState("idle");
          }, 600);
          return "processing";
        }
        return "idle";
      });
    };

    recognitionRef.current = rec;
    return () => {
      try { rec.stop(); } catch {}
    };
  }, []);

  const handleMic = () => {
    if (!supported) return;
    const rec = recognitionRef.current;
    if (!rec) return;

    if (micState === "listening") {
      rec.stop();
      return;
    }
    setTranscript("");
    try {
      rec.start();
      setMicState("listening");
    } catch {
      // Already started
    }
  };

  return (
    <main className="min-h-screen bg-gradient-soft">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-10 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <Calculator className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Calci
            </h1>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            CGPA Calculator
          </span>
        </header>

        {/* Voice section */}
        <section className="rounded-3xl bg-gradient-card border border-border shadow-soft p-8 sm:p-10 mb-6">
          <MicButton state={micState} onClick={handleMic} supported={supported} />

          {/* Transcript */}
          <div className="mt-6 min-h-[60px]">
            {transcript ? (
              <div className="rounded-2xl bg-accent/60 border border-accent px-4 py-3 animate-fade-in">
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 mt-0.5 text-accent-foreground shrink-0" />
                  <p className="text-sm text-accent-foreground leading-relaxed">
                    {transcript}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/50 border border-dashed border-border px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Try saying:{" "}
                  <span className="font-medium text-foreground">
                    "Math 4 credits A, Physics 3 credits B+"
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Upload */}
          <UploadMarksheet
            onExtracted={(extracted) =>
              setSubjects((curr) => [...curr, ...extracted])
            }
          />
        </section>

        {/* Manual entry */}
        <section className="rounded-3xl bg-card border border-border shadow-soft p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Subjects</h2>
              <p className="text-sm text-muted-foreground">
                Edit, add or remove rows manually
              </p>
            </div>
            {subjects.length > 0 && (
              <button
                onClick={() => setSubjects([])}
                className="text-xs font-medium text-muted-foreground hover:text-destructive transition-smooth"
              >
                Clear all
              </button>
            )}
          </div>
          <SubjectsTable subjects={subjects} onChange={setSubjects} />
        </section>

        {/* Result */}
        <ResultCard
          cgpa={result.cgpa}
          percentage={result.percentage}
          totalCredits={result.totalCredits}
        />

        <p className="text-center text-xs text-muted-foreground mt-8">
          O=10 · A+=9 · A=8 · B+=7 · B=6 · C=5 · U=0
        </p>
      </div>
    </main>
  );
};

export default Index;
