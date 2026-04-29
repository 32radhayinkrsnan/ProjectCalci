import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Upload, Loader2, FileImage, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Subject, GRADE_POINTS } from "@/lib/calci/grades";

interface Props {
  onExtracted: (subjects: Subject[]) => void;
}

const ACCEPTED = "image/png,image/jpeg,image/jpg,image/webp";
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function UploadMarksheet({ onExtracted }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!ACCEPTED.split(",").includes(file.type)) {
      toast({
        title: "Unsupported file",
        description: "Please upload a PNG, JPG or WEBP image.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 8 MB.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setLoading(true);
    try {
      const imageBase64 = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke("extract-marksheet", {
        body: { imageBase64, mimeType: file.type },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const raw = Array.isArray(data?.subjects) ? data.subjects : [];
      const subjects: Subject[] = raw
        .filter((s: any) => s && s.name && s.grade in GRADE_POINTS)
        .map((s: any, i: number) => ({
          id: `${Date.now()}-up-${i}`,
          name: String(s.name).trim(),
          credits: Math.max(1, parseInt(String(s.credits)) || 3),
          grade: String(s.grade).toUpperCase(),
        }));

      if (subjects.length === 0) {
        toast({
          title: "No subjects found",
          description: "Try a clearer image of the marksheet.",
          variant: "destructive",
        });
      } else {
        onExtracted(subjects);
        toast({
          title: `Extracted ${subjects.length} subject${subjects.length > 1 ? "s" : ""}`,
        });
      }
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.message || "Couldn't extract subjects.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (loading) return;
    handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // reset so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mt-5">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={onChange}
        className="hidden"
      />
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!loading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload marksheet"
        className={cn(
          "w-full rounded-2xl border-2 border-dashed px-4 py-5",
          "flex flex-col items-center justify-center gap-2 text-center cursor-pointer",
          "transition-smooth",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/40",
          loading && "opacity-70 cursor-wait"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm font-medium">Extracting subjects…</p>
            <p className="text-xs text-muted-foreground truncate max-w-full">
              {fileName}
            </p>
          </>
        ) : fileName ? (
          <>
            <FileImage className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Tap to upload another</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-full">
              <span className="truncate">{fileName}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFileName(null);
                }}
                className="ml-1 hover:text-destructive"
                aria-label="Clear file"
              >
                <X className="h-3 w-3" />
              </button>
            </p>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Upload Marksheet</p>
            <p className="text-xs text-muted-foreground">
              Drag & drop or tap — PNG, JPG, WEBP (max 8 MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
}