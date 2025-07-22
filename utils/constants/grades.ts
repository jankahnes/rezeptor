const grades = [
  { min_score: -100, grade: 'F' },
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
  { min_score: 92, grade: 'S' },
  { min_score: 96, grade: 'S+' },
];

const recipeOvrGrades = [
  { min_score: -100, grade: 'F' },
  { min_score:   2.0, grade: 'E-' },
  { min_score:   7.1, grade: 'E' },
  { min_score:  12.1, grade: 'E+' },
  { min_score:  17.2, grade: 'D-' },
  { min_score:  22.3, grade: 'D' },
  { min_score:  27.3, grade: 'D+' },
  { min_score:  32.4, grade: 'C-' },
  { min_score:  37.5, grade: 'C' },
  { min_score:  42.5, grade: 'C+' },
  { min_score:  47.6, grade: 'B-' },
  { min_score:  52.7, grade: 'B' },
  { min_score:  57.7, grade: 'B+' },
  { min_score:  62.8, grade: 'A-' },
  { min_score:  67.9, grade: 'A' },
  { min_score:  72.9, grade: 'A+' },
  { min_score:  78.0, grade: 'S-' },
  { min_score:  83,  grade: 'S' },
  { min_score:  88,  grade: 'S+' },
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
  for (const grade of type === 'hidx' ? recipeOvrGrades : grades) {
    if (grade.min_score <= score) {
      highest_grade = grade.grade;
    }
  }
  return highest_grade;
}
