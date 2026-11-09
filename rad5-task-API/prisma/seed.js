// Fills the database with demo data. Run with: npm run seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/db.js";

async function main() {
  // Clear old data (children first)
  await prisma.reminder.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const ada = await prisma.user.create({
    data: { name: "Ada (Web Dev)", email: "ada@rad5.com", password },
  });
  const tobi = await prisma.user.create({
    data: { name: "Tobi (Data Analysis)", email: "tobi@rad5.com", password },
  });

  const task = await prisma.task.create({
    data: {
      title: "Finish JavaScript assignment",
      description: "Functions and arrays exercises",
      status: "IN_PROGRESS",
      userId: ada.id,
    },
  });
  await prisma.task.create({
    data: { title: "Clean the sales dataset", status: "TODO", userId: tobi.id },
  });
  await prisma.task.create({
    data: { title: "Buy data for the week", status: "DONE", userId: ada.id },
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.reminder.createMany({
    data: [
      { message: "JS assignment is due!", type: "DEADLINE", remindAt: tomorrow, userId: ada.id, taskId: task.id },
      { message: "Study 7pm - 9pm", type: "STUDY", remindAt: new Date(), userId: ada.id },
      { message: "Small steps every day beat big steps once.", type: "MOTIVATION", remindAt: new Date(), userId: tobi.id },
    ],
  });

  console.log("Seed done. Login with ada@rad5.com / password123");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
