import { db } from '../prisma/db';
import type { Models } from '../prisma/contract';
import type { Scalars } from '@prisma/orm-postgres/family-contract/types';

/** Public user fields only: passwordHash is deliberately not selected. */
export type User = Pick<Scalars<Models.public_User>, 'id' | 'email' | 'name' | 'role' | 'createdAt'>;

/**
 * 6. Users who have NO assigned tasks (Task.assigneeId pointing at them).
 * Tasks they merely own do not count; `User.tasks` is the assignee side.
 */
export async function listUsersWithoutAssignedTasks(): Promise<User[]> {
  return db.orm.public.User
    .select('id', 'email', 'name', 'role', 'createdAt')
    .where((u) => u.tasks.none())
    .orderBy((u) => u.id.asc())
    .all();
}
