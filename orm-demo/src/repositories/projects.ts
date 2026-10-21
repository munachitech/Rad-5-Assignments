import { db } from '../prisma/db';
import type { Models } from '../prisma/contract';
import type { Scalars, Shape } from '@prisma/orm-postgres/family-contract/types';

type Project = Scalars<Models.public_Project>;

/** Item 1 result: a project row plus the number of tasks in it. */
export type ProjectWithTaskCount = Project & { tasks: number };

/**
 * 1. List projects for a user with a task count.
 * One query: the relation is reduced to a count inside the include refinement.
 */
export async function listProjectsForUser(userId: number): Promise<ProjectWithTaskCount[]> {
  return db.orm.public.Project
    .where({ ownerId: userId })
    .orderBy([(p) => p.createdAt.desc(), (p) => p.id.desc()])
    .include('tasks', (t) => t.count())
    .all();
}

/**
 * Item 2 result: project -> tasks -> task_tags rows -> tag.
 * Task.tags is the explicit TaskTag join model, so each "tag" entry is a join row
 * that carries the Tag itself under `.tag`.
 */
export type ProjectWithTasksAndTags = Shape<
  Models.public_Project,
  { tasks: { tags: { '+': 'tag' } } }
>;

/**
 * 2. Get a project with its tasks and each task's tags (nested include, no N+1).
 */
export async function getProjectWithTasksAndTags(
  projectId: number,
): Promise<ProjectWithTasksAndTags | null> {
  return db.orm.public.Project
    .where({ id: projectId })
    .include('tasks', (t) =>
      t
        .orderBy((task) => task.id.asc())
        .include('tags', (tt) => tt.include('tag')),
    )
    .first();
}
