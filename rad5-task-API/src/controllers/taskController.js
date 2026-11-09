import prisma from "../config/db.js";

const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];

// GET /api/tasks  or  GET /api/tasks?status=DONE
export const getTasks = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status must be TODO, IN_PROGRESS or DONE" });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: req.userId, ...(status && { status }) },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
export const getTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });

    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const task = await prisma.task.create({
      data: { title, description, status, userId: req.userId },
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const updated = await prisma.task.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const task = await prisma.task.findFirst({ where: { id, userId: req.userId } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};
