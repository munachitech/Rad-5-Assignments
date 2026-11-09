import prisma from "../config/db.js";

const validTypes = ["DEADLINE", "STUDY", "MOTIVATION"];

// Used when a reminder is linked to a task: the task must belong to this user
const taskBelongsToUser = async (taskId, userId) => {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  return task !== null;
};

// GET /api/reminders  or  GET /api/reminders?type=STUDY
export const getReminders = async (req, res, next) => {
  try {
    const { type } = req.query;

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ error: "Type must be DEADLINE, STUDY or MOTIVATION" });
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: req.userId, ...(type && { type }) },
      orderBy: { remindAt: "asc" },
    });

    res.json(reminders);
  } catch (err) {
    next(err);
  }
};

// GET /api/reminders/due
// Reminders whose time has arrived and are not done yet.
// The frontend can call this every minute to show an in-app notification.
export const getDueReminders = async (req, res, next) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.userId, done: false, remindAt: { lte: new Date() } },
      orderBy: { remindAt: "asc" },
    });

    res.json(reminders);
  } catch (err) {
    next(err);
  }
};

// POST /api/reminders
export const createReminder = async (req, res, next) => {
  try {
    const { message, type, remindAt, taskId } = req.body;

    if (taskId && !(await taskBelongsToUser(taskId, req.userId))) {
      return res.status(404).json({ error: "Task not found" });
    }

    const reminder = await prisma.reminder.create({
      data: { message, type, remindAt, taskId, userId: req.userId },
    });

    res.status(201).json(reminder);
  } catch (err) {
    next(err);
  }
};

// PUT /api/reminders/:id  (send { "done": true } to dismiss one)
export const updateReminder = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const reminder = await prisma.reminder.findFirst({ where: { id, userId: req.userId } });
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });

    if (req.body.taskId && !(await taskBelongsToUser(req.body.taskId, req.userId))) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updated = await prisma.reminder.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reminders/:id
export const deleteReminder = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const reminder = await prisma.reminder.findFirst({ where: { id, userId: req.userId } });
    if (!reminder) return res.status(404).json({ error: "Reminder not found" });

    await prisma.reminder.delete({ where: { id } });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    next(err);
  }
};
