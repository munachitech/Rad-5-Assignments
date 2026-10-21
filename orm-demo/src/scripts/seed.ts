import { db } from '../prisma/db';
import type { Task } from '../repositories/tasks';

/**
 * Non-destructive demo seed. Every row it creates is recognisable:
 *   users  -> email  demo-*@example.com
 *   tags   -> label  demo-*
 *   projects/tasks hang off the demo users, so they go with them.
 * It only ever deletes those demo rows, never anything else in the database.
 */
const DEMO_EMAIL_PATTERN = 'demo-%@example.com';
const DEMO_TAG_PATTERN = 'demo-%';

/** Removes previously seeded demo rows (and, via cascade, their projects/tasks/links). */
export async function cleanupDemoData(): Promise<void> {
  await db.orm.public.User.where((u) => u.email.like(DEMO_EMAIL_PATTERN)).deleteAll();
  await db.orm.public.Tag.where((t) => t.label.like(DEMO_TAG_PATTERN)).deleteAll();
}

export async function seed(): Promise<{ aliceId: number; bobId: number; projectId: number }> {
  await cleanupDemoData();

  const alice = await db.orm.public.User.create({ email: 'demo-alice@example.com', name: 'Demo Alice', passwordHash: 'x' });
  const bob = await db.orm.public.User.create({ email: 'demo-bob@example.com', name: 'Demo Bob', passwordHash: 'x' });
  await db.orm.public.User.create({ email: 'demo-carol@example.com', name: 'Demo Carol', passwordHash: 'x' });

  const p1 = await db.orm.public.Project.create({ name: 'Demo Website', ownerId: alice.id });
  await db.orm.public.Project.create({ name: 'Demo Empty project', ownerId: alice.id });

  const sql = await db.orm.public.Tag.create({ label: 'demo-sql' });
  const bug = await db.orm.public.Tag.create({ label: 'demo-bug' });
  const docs = await db.orm.public.Tag.create({ label: 'demo-docs' });

  const titles: Array<[string, 'todo' | 'in_progress' | 'done', number | null]> = [
    ['Write SQL migration', 'todo', alice.id],
    ['Fix login bug', 'in_progress', alice.id],
    ['Update docs', 'done', bob.id],
    ['Learn sql joins', 'todo', alice.id],
    ['Design landing page', 'todo', bob.id],
    ['Refactor repository layer', 'done', alice.id],
    ['Unassigned chore', 'todo', null],
  ];
  const tasks: Task[] = [];
  for (const [title, status, assigneeId] of titles) {
    tasks.push(
      await db.orm.public.Task.create({
        title,
        status,
        projectId: p1.id,
        ownerId: alice.id,
        ...(assigneeId === null ? {} : { assigneeId }),
      }),
    );
  }
  const link = async (taskIdx: number, tagId: number): Promise<void> => {
    await db.orm.public.TaskTag.create({ taskId: tasks[taskIdx]!.id, tagId });
  };
  await link(0, sql.id);
  await link(1, bug.id);
  await link(2, docs.id);
  await link(3, sql.id);
  await link(3, docs.id);

  return { aliceId: alice.id, bobId: bob.id, projectId: p1.id };
}
