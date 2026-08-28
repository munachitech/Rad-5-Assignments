import { students } from "./students.js";
import { getStudentsByGrade } from "./grades.js";
import {
  calculateAverage,
  getTopStudents,
  getGradeDistribution,
  getPassingStudents,
  getStudentByName
} from "./statistics.js";
import { printReport } from "./report.js";

printReport(students);

console.log("Grade A:", getStudentsByGrade(students, "A"));
console.log("Average:", calculateAverage(students));
console.log("Top Students:", getTopStudents(students, 2));
console.log("Grade Distribution:", getGradeDistribution(students));
console.log("Passing Students:", getPassingStudents(students));
console.log("Student:", getStudentByName(students, "Ada"));