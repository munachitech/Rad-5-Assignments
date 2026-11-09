export const getStudentsByGrade = (students, grade) =>
  students.filter(({ grade: studentGrade }) => studentGrade === grade);