import { db } from '../prisma/db';
import type { Models } from '../prisma/contract';
import type { Scalars } from '@prisma/orm-postgres/family-contract/types';

export type Task = Scalars<Models.public_Task>;
export type TaskStatus = Models.public_Task['status'];

/**
 * 3. Tasks assigned to a user, filtered by status, newest first.
 * `id` is a tiebreaker so the order is deterministic for equal timestamps.
 */
export async function listTasksAssignedToUser(userId: number, status: TaskStatus): Promise<Task[]> {
  return db.orm.public.Task
    .where({ assigneeId: userId, status })
    .orderBy([(t) => t.createdAt.desc(), (t) => t.id.desc()])
    .all();
}

/**
 * 4. Case-insensitive title search. The caller passes the bare term; wildcards are added here.
 * `%` and `_` typed by the user are escaped so they match literally.
 */
export async function searchTasksByTitle(term: string): Promise<Task[]> {
  const escaped = term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
  return db.orm.public.Task
    .where((t) => t.title.ilike(`%${escaped}%`))
    .orderBy([(t) => t.createdAt.desc(), (t) => t.id.desc()])
    .all();
}

/**
 * 5. Tasks that have at least one tag whose label is in `labels`.
 * Task.tags is the TaskTag join model, so the label is reached through the join row's `tag`
 * relation, filtered with a nested `.some(...)`.
 */
export async function listTasksWithAnyTag(labels: readonly string[]): Promise<Task[]> {
  if (labels.length === 0) return [];
  return db.orm.public.Task
    .where((t) => t.tags.some((tt) => tt.tag.some((tag) => tag.label.in([...labels]))))
    .orderBy((t) => t.id.asc())
    .all();
}

/** Item 7 result. */
export interface TaskPage {
  items: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 7. Offset-paginate the tasks of one project. `page` is 1-based.
 * The page rows and the total share the same predicate; the total comes from aggregate().
 */
export async function listProjectTasksPage(
  projectId: number,
  page: number,
  limit: number,
): Promise<TaskPage> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const safePage = Math.max(1, Math.floor(page));
  const scope = db.orm.public.Task.where({ projectId });

  const [items, totals] = await Promise.all([
    scope
      .orderBy([(t) => t.createdAt.desc(), (t) => t.id.desc()])
      .limit(safeLimit)
      .offset((safePage - 1) * safeLimit)
      .all(),
    scope.aggregate((a) => ({ total: a.count() })),
  ]);

  return {
    items,
    total: totals.total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(totals.total / safeLimit),
  };
}

/** Item 8 result. `nextCursor` is null on the last page. */
export interface TaskCursorPage {
  items: Task[];
  nextCursor: number | null;
}

/**
 * 8. Cursor-paginate the tasks of one project by id (ascending).
 * Pass the previous page's `nextCursor` to continue; omit it for the first page.
 * Fetches limit + 1 rows so "is there another page?" needs no extra query.
 */
export async function listProjectTasksCursor(
  projectId: number,
  limit: number,
  cursor?: number,
): Promise<TaskCursorPage> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const ordered = db.orm.public.Task
    .where({ projectId })
    .orderBy((t) => t.id.asc());
  const positioned = cursor === undefined ? ordered : ordered.cursor({ id: cursor });

  const rows = await positioned.limit(safeLimit + 1).all();
  const items = rows.slice(0, safeLimit);
  const last = items[items.length - 1];
  const nextCursor = rows.length > safeLimit && last !== undefined ? last.id : null;
  return { items, nextCursor };
}

/** Item 9 result row. */
export interface StatusCount {
  status: TaskStatus;
  count: number;
}

/**
 * 9. Group tasks by status with counts.
 */
export async function countTasksByStatus(): Promise<StatusCount[]> {
  return db.orm.public.Task
    .groupBy('status')
    .aggregate((a) => ({ count: a.count() }));
}

/** Item 10 result. `newestCreatedAt` is null when there are no tasks. */
export type TaskTotals = { totalTasks: number; newestCreatedAt: Task['createdAt'] | null };

/**
 * 10. Aggregate: total task count and the newest createdAt.
 */
export async function getTaskTotals(): Promise<TaskTotals> {
  return db.orm.public.Task.aggregate((a) => ({
    totalTasks: a.count(),
    newestCreatedAt: a.max('createdAt'),
  }));
}
