export const GRADE_POINTS: Record<string, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  U: 0,
};

export const GRADES = ["O", "A+", "A", "B+", "B", "C", "U"];

export interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export function calculateCGPA(subjects: Subject[]) {
  const valid = subjects.filter(
    (s) => s.credits > 0 && s.grade in GRADE_POINTS
  );
  const totalCredits = valid.reduce((sum, s) => sum + s.credits, 0);
  const totalPoints = valid.reduce(
    (sum, s) => sum + s.credits * GRADE_POINTS[s.grade],
    0
  );
  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  const percentage = cgpa * 9.5; // Common conversion (Anna Univ style)
  return { cgpa, percentage, totalCredits };
}

/**
 * Parse a spoken transcript like:
 * "Math 4 credits A, Physics 3 credits B+"
 * Tolerates: "math four credits a plus", "physics 3 credit b+", "and", etc.
 */
export function parseTranscript(transcript: string): Subject[] {
  if (!transcript) return [];
  const text = transcript.toLowerCase().trim();

  // Normalize spoken numbers and grade phrases
  const numWords: Record<string, string> = {
    zero: "0", one: "1", two: "2", three: "3", four: "4",
    five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  };

  let normalized = text
    .replace(/\b(a|b)\s*plus\b/g, "$1+")
    .replace(/\bgrade\s+/g, "")
    .replace(/\s+and\s+/g, ", ")
    .replace(/\bcredit(s)?\b/g, "credits");

  Object.entries(numWords).forEach(([w, n]) => {
    normalized = normalized.replace(new RegExp(`\\b${w}\\b`, "g"), n);
  });

  // Split by comma / semicolon / "then"
  const chunks = normalized
    .split(/[,;]| then /)
    .map((c) => c.trim())
    .filter(Boolean);

  const subjects: Subject[] = [];

  chunks.forEach((chunk, idx) => {
    // Pattern: <name words> <credits number> credits <grade>
    const m = chunk.match(
      /^([a-z][a-z\s]*?)\s+(\d+)\s*credits?\s+(o|a\+|a|b\+|b|c|u)\b/i
    );
    if (m) {
      const name = m[1].trim().replace(/\b\w/g, (c) => c.toUpperCase());
      const credits = parseInt(m[2], 10);
      const grade = m[3].toUpperCase();
      subjects.push({
        id: `${Date.now()}-${idx}`,
        name,
        credits,
        grade,
      });
    }
  });

  return subjects;
}