import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GRADES, Subject } from "@/lib/calci/grades";

interface Props {
  subjects: Subject[];
  onChange: (s: Subject[]) => void;
}

export function SubjectsTable({ subjects, onChange }: Props) {
  const update = (id: string, patch: Partial<Subject>) => {
    onChange(subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };
  const remove = (id: string) => onChange(subjects.filter((s) => s.id !== id));
  const add = () =>
    onChange([
      ...subjects,
      { id: `${Date.now()}-${Math.random()}`, name: "", credits: 3, grade: "A" },
    ]);

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-[1fr_110px_110px_44px] gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Subject</span>
        <span>Credits</span>
        <span>Grade</span>
        <span />
      </div>

      {subjects.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No subjects yet. Add one to get started.
        </p>
      )}

      <div className="space-y-2">
        {subjects.map((s, i) => (
          <div
            key={s.id}
            className="grid grid-cols-[1fr_80px_80px_40px] sm:grid-cols-[1fr_110px_110px_44px] gap-2 items-center animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <Input
              value={s.name}
              onChange={(e) => update(s.id, { name: e.target.value })}
              placeholder="Subject name"
              className="h-11"
            />
            <Input
              type="number"
              min={1}
              max={10}
              value={s.credits}
              onChange={(e) =>
                update(s.id, { credits: parseInt(e.target.value) || 0 })
              }
              className="h-11 text-center"
            />
            <Select
              value={s.grade}
              onValueChange={(v) => update(s.id, { grade: v })}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(s.id)}
              className="h-11 w-11 text-muted-foreground hover:text-destructive"
              aria-label="Remove subject"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        onClick={add}
        variant="outline"
        className="w-full h-11 border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add subject
      </Button>
    </div>
  );
}