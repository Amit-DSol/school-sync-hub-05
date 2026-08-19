/**
 * Shared ordering helpers so every list in the app is presented in a
 * predictable, human-friendly series (natural / numeric aware).
 */

/** Natural compare: "2" before "10", "1 A" before "1 B". */
export function naturalCompare(a?: string | null, b?: string | null): number {
  const x = (a ?? "").trim();
  const y = (b ?? "").trim();
  if (!x && !y) return 0;
  if (!x) return 1; // blanks last
  if (!y) return -1;
  const re = /(\d+|\D+)/g;
  const xs = x.toLowerCase().match(re) ?? [];
  const ys = y.toLowerCase().match(re) ?? [];
  for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
    const p = xs[i];
    const q = ys[i];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    const pn = /^\d/.test(p);
    const qn = /^\d/.test(q);
    if (pn && qn) {
      const d = Number(p) - Number(q);
      if (d) return d;
    } else {
      const d = p.localeCompare(q);
      if (d) return d;
    }
  }
  return 0;
}

type ClassLike = { name?: string | null; section?: string | null };

/** Grade number first (1..12), then class name, then section. */
export function compareClasses(a: ClassLike, b: ClassLike): number {
  const g = (v?: string | null) => {
    const m = String(v ?? "").match(/\d+/);
    return m ? Number(m[0]) : Number.POSITIVE_INFINITY;
  };
  return (
    g(a.name) - g(b.name) ||
    naturalCompare(a.name, b.name) ||
    naturalCompare(a.section, b.section)
  );
}

export function sortClasses<T extends ClassLike>(rows: T[]): T[] {
  return [...rows].sort(compareClasses);
}

type StudentLike = {
  roll_number?: string | number | null;
  admission_number?: string | null;
  full_name?: string | null;
  profile?: { full_name?: string | null } | null;
};

const studentName = (s: StudentLike) => s.full_name ?? s.profile?.full_name ?? "";

/** Roll number numerically ascending (blanks last), then name. */
export function compareStudents(a: StudentLike, b: StudentLike): number {
  return (
    naturalCompare(a.roll_number == null ? null : String(a.roll_number),
      b.roll_number == null ? null : String(b.roll_number)) ||
    naturalCompare(a.admission_number, b.admission_number) ||
    naturalCompare(studentName(a), studentName(b))
  );
}

export function sortStudents<T extends StudentLike>(rows: T[]): T[] {
  return [...rows].sort(compareStudents);
}

/** Class series first, then roll number — for cross-class student lists. */
export function sortStudentsByClassThenRoll<
  T extends StudentLike & { classes?: ClassLike | null },
>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      compareClasses(a.classes ?? {}, b.classes ?? {}) || compareStudents(a, b),
  );
}
