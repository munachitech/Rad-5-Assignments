export const calculateAverage = (students) =>
  students.reduce((total, { score }) => total + score, 0) / students.length;

export const getTopStudents = (students, count = 3) =>
  [...students].sort((a, b) => b.score - a.score).slice(0, count);

export const getGradeDistribution = (students) =>
  students.reduce((distribution, { grade }) => {
    distribution[grade] = (distribution[grade] || 0) + 1;
    return distribution;
  }, {});

export const getPassingStudents = (students, passScore = 50) =>
  students.filter(({ score }) => score >= passScore);

export const getStudentByName = (students, name) =>
  students.find(({ name: studentName }) => studentName === name);