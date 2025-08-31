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
  { min_score:  0, grade: 'E-' },
  { min_score:  10, grade: 'E' },
  { min_score:  20, grade: 'E+' },
  { min_score:  25, grade: 'D-' },
  { min_score:  32, grade: 'D' },
  { min_score:  38, grade: 'D+' },
  { min_score:  43, grade: 'C-' },
  { min_score:  47, grade: 'C' },
  { min_score:  51, grade: 'C+' },
  { min_score:  55, grade: 'B-' },
  { min_score:  59, grade: 'B' },
  { min_score:  63, grade: 'B+' },
  { min_score:  67, grade: 'A-' },
  { min_score:  71, grade: 'A' },
  { min_score:  75, grade: 'A+' },
  { min_score:  78, grade: 'S-' },
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

export const gradeTextColors: Record<string, string> = {
  S: 'text-blue-800',
  'S+': 'text-blue-800',
  'S-': 'text-blue-800',

  'A+': 'text-emerald-800',
  A: 'text-emerald-800',
  'A-': 'text-emerald-800',

  'B+': 'text-green-800',
  B: 'text-green-800',
  'B-': 'text-green-800',

  'C+': 'text-yellow-800',
  C: 'text-yellow-800',
  'C-': 'text-yellow-800',

  'D+': 'text-orange-900',
  D: 'text-orange-900',
  'D-': 'text-orange-900',

  'E+': 'text-red-900',
  E: 'text-red-900',
  'E-': 'text-red-900',

  F: 'text-red-950',
}

export const gradeBorderColors: Record<string, string> = {
  S: 'border-blue-100',
  A: 'border-green-200',
  B: 'border-green-200',
  C: 'border-yellow-100',
  D: 'border-orange-200',
  E: 'border-red-200',
  F: 'border-red-300',
};

const gradeShadows: Record<string, string> = {
  S: 'shadow-halo-blue shadow-halo ',
  A: 'shadow-halo-emerald shadow-halo ',
  B: 'shadow-halo-green shadow-halo ',
  C: 'shadow-gray-200 shadow-halo ',
  D: 'shadow-gray-200 shadow-halo ',
  E: 'shadow-gray-200 shadow-halo ',
  F: 'shadow-gray-200 shadow-halo ',
}

export function getGradeBorderColor(score: number, type: 'hidx' | 'score' = 'score') {
  const grade = getGrade(score, type);
  const roundedGrade = grade.replace('+', '').replace('-', '');
  return gradeBorderColors[roundedGrade];
}

export function getGradeShadow(score: number, type: 'hidx' | 'score' = 'score') {
  const grade = getGrade(score, type);
  const roundedGrade = grade.replace('+', '').replace('-', '');
  return gradeShadows[roundedGrade];
}

export function getGrade(score: number, type: 'hidx' | 'score' = 'score') {
  let highest_grade = '';
  for (const grade of type === 'hidx' ? recipeOvrGrades : grades) {
    if (grade.min_score <= score) {
      highest_grade = grade.grade;
    }
  }
  return highest_grade;
}