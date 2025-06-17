const grades = [
  { min_score: 0, grade: 'F' },
  { min_score: 10, grade: 'E' },
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

export function getHidxGrade(score: number) {
  let highest_grade = '';
  for (const grade of grades) {
    if (grade.min_score <= score) {
      highest_grade = grade.grade;
    }
  }
  return highest_grade
}
