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
  { min_score: 97, grade: 'S+' },
];

const hidxGrades = [
  { min_score: 0, grade: 'F' },
  { min_score: 20.0, grade: 'E-' },
  { min_score: 24.53, grade: 'E' },
  { min_score: 29.06, grade: 'E+' },
  { min_score: 33.59, grade: 'D-' },
  { min_score: 38.12, grade: 'D' },
  { min_score: 42.65, grade: 'D+' },
  { min_score: 47.18, grade: 'C-' },
  { min_score: 51.71, grade: 'C' },
  { min_score: 56.24, grade: 'C+' },
  { min_score: 60.76, grade: 'B-' },
  { min_score: 65.29, grade: 'B' },
  { min_score: 69.82, grade: 'B+' },
  { min_score: 74.35, grade: 'A-' },
  { min_score: 78.88, grade: 'A' },
  { min_score: 83.41, grade: 'A+' },
  { min_score: 87.94, grade: 'S-' },
  { min_score: 92.47, grade: 'S' },
  { min_score: 97.0, grade: 'S+' },
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
  D: 'bg-orange-200 text-orange-900',
  'D-': 'bg-orange-200 text-orange-950',

  'E+': 'bg-red-200 text-red-900',
  E: 'bg-red-200 text-red-900',
  'E-': 'bg-red-200 text-red-900',

  F: 'bg-red-300 text-red-950',
};

export function getGrade(score: number, type: 'hidx' | 'score' = 'score') {
  let highest_grade = '';
  for (const grade of type === 'hidx' ? hidxGrades : grades) {
    if (grade.min_score <= score) {
      highest_grade = grade.grade;
    }
  }
  return highest_grade;
}
