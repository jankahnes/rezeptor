const grades = [
  { min_score: 0, grade: 'F' },
  { min_score: 4, grade: 'E-' },
  { min_score: 9, grade: 'E' },
  { min_score: 12, grade: 'E+' },
  { min_score: 15, grade: 'D-' },
  { min_score: 20, grade: 'D' },
  { min_score: 30, grade: 'D+' },
  { min_score: 38, grade: 'C-' },
  { min_score: 44, grade: 'C' },
  { min_score: 50, grade: 'C+' },
  { min_score: 56, grade: 'B-' },
  { min_score: 60, grade: 'B' },
  { min_score: 64, grade: 'B+' },
  { min_score: 68, grade: 'A-' },
  { min_score: 73, grade: 'A' },
  { min_score: 83, grade: 'A+' },
  { min_score: 88, grade: 'S-' },
  { min_score: 93, grade: 'S' },
  { min_score: 100, grade: 'S+' },
];

export const gradeColors: Record<string, string> = {
  S: 'bg-blue-100 text-blue-800',
  'S+': 'bg-blue-100 text-blue-800',
  'S-': 'bg-blue-100 text-blue-800',

  'A+': 'bg-emerald-100 text-emerald-800',
  A: 'bg-emerald-100 text-emerald-800',
  'A-': 'bg-emerald-100 text-emerald-800',

  'B+': 'bg-green-100 text-green-800',
  B: 'bg-green-100 text-green-800',
  'B-': 'bg-green-100 text-green-800',

  'C+': 'bg-yellow-100 text-yellow-800',
  C: 'bg-yellow-100 text-yellow-800',
  'C-': 'bg-yellow-100 text-yellow-800',

  'D+': 'bg-orange-200 text-orange-900',
  D: 'bg-orange-300 text-orange-900',
  'D-': 'bg-orange-400 text-orange-950',

  'E+': 'bg-red-200 text-red-700',
  E: 'bg-red-200 text-red-800',
  'E-': 'bg-red-200 text-red-900',

  F: 'bg-red-300 text-red-950',
};

export function getGrade(score: number) {
  let highest_grade = '';
  for (const grade of grades) {
    if (grade.min_score <= score) {
      highest_grade = grade.grade;
    }
  }
  return highest_grade;
}
