
const students = [
  {
    name: "Ada",
    age: "20",
    scores: [75, 82, 68]
  },
  {
    name: "John",
    age: "22",
    scores: [45, 51, 49]
  },
  {
    name: "Mary",
    age: "19",
    scores: [90, 88, 95]
  }
];

// TYPE COERCION
console.log("Type coercion demonstration:");
console.log('"20" + 5 =', "20" + 5);
console.log('Number("20") + 5 =', Number("20") + 5);
// FUNCTION DECLARATIO

function calculateTotal(scores) {
  let total = 0;

  for (const score of scores) {
    total += score;
  }

  return total;
}
// FUNCTION EXPRESSION
const calculateAverage = function (scores) {
  const total = calculateTotal(scores);
  return Math.round(total / scores.length);
};

// GET GRADE
function getGrade(average) {
  if (average >= 70) {
    return "A";
  } else if (average >= 60) {
    return "B";
  } else if (average >= 50) {
    return "C";
  } else if (average >= 40) {
    return "D";
  } else {
    return "F";
  }
}

// GET STATUS

function getStatus(average) {
  if (average >= 50) {
    return "PASS";
  } else {
    return "FAIL";
  }
}

// BEST STUDENT

function getBestStudent(students) {
  let bestStudent = students[0];
  let highestAverage = calculateAverage(bestStudent.scores);

  for (const student of students) {
    const average = calculateAverage(student.scores);

    if (average > highestAverage) {
      highestAverage = average;
      bestStudent = student;
    }
  }

  return bestStudent;
}

// CLASS AVERAGE


function getClassAverage(students) {
  let totalAverage = 0;

  for (const student of students) {
    totalAverage += calculateAverage(student.scores);
  }

  return (totalAverage / students.length).toFixed(1);
}


// PROCESS STUDENTS
// ==============================

console.log("\n===== STUDENT RESULT ANALYZER =====");

for (const student of students) {

  console.log("Processing student:", student.name);

  console.log("Scores:", student.scores);

  const age = Number(student.age);

  const total = calculateTotal(student.scores);
  const average = calculateAverage(student.scores);
  const grade = getGrade(average);
  const status = getStatus(average);

  console.log("Calculated average:", average);

  
  const studentName = student.name.trim().toUpperCase();

  // Array operation
  const numberOfSubjects = student.scores.length;

  console.log(`
Student: ${studentName}
Age: ${age}
Total Score: ${total}
Average: ${average}
Grade: ${grade}
Status: ${status}
Subjects: ${numberOfSubjects}
==============================
`);
}


const bestStudent = getBestStudent(students);
const bestAverage = calculateAverage(bestStudent.scores);
const bestGrade = getGrade(bestAverage);

console.log(`🏆 Best Student: ${bestStudent.name.toUpperCase()}`);
console.log(`Average: ${bestAverage}`);
console.log(`Grade: ${bestGrade}`);

const classAverage = getClassAverage(students);

console.log(`Class Average: ${classAverage}`);


function scopeExample() {
  const secretMessage = "This variable is inside the function.";

  console.log(secretMessage);
}

scopeExample();
