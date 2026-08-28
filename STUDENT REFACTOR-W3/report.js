import { calculateAverage } from "./statistics.js";
import { formatStudent } from "./formatters.js";

export const printReport = (students) => {
  console.log("=== Student Report ===");

  students.forEach((student) => {
    console.log(formatStudent(student));
  });

  console.log(`Average: ${calculateAverage(students)}`);
};