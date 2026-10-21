import 'temporal-polyfill/global';
import { db } from '../prisma/db';
import { seed, cleanupDemoData } from './seed';
import { listProjectsForUser, getProjectWithTasksAndTags } from '../repositories/projects';
import {
  listTasksAssignedToUser,
  searchTasksByTitle,
  listTasksWithAnyTag,
  listProjectTasksPage,
  listProjectTasksCursor,
  countTasksByStatus,
  getTaskTotals,
} from '../repositories/tasks';
import { listUsersWithoutAssignedTasks } from '../repositories/users';

function print(label: string, value: unknown): void {
  const text = JSON.stringify(value, (_k, v: unknown) => (typeof v === 'bigint' ? v.toString() : v), 2);
  console.log(`\n=== ${label} ===\n${text}`);
}

async function main(): Promise<void> {
  const { aliceId, bobId, projectId } = await seed();

  print('1. projects for user with task count', await listProjectsForUser(aliceId));
  print('2. project with tasks and tags', await getProjectWithTasksAndTags(projectId));
  print('3. tasks assigned to Alice, status=todo, newest first', await listTasksAssignedToUser(aliceId, 'todo'));
  print('4. title ilike "sql"', await searchTasksByTitle('sql'));
  print('5. tasks tagged bug or docs', await listTasksWithAnyTag(['demo-bug', 'demo-docs']));
  print('6. users with no assigned tasks', await listUsersWithoutAssignedTasks());
  print('7. offset page 2, limit 3', await listProjectTasksPage(projectId, 2, 3));

  const first = await listProjectTasksCursor(projectId, 3);
  print('8a. cursor page 1', first);
  const second = await listProjectTasksCursor(projectId, 3, first.nextCursor ?? undefined);
  print('8b. cursor page 2', second);
  const third = await listProjectTasksCursor(projectId, 3, second.nextCursor ?? undefined);
  print('8c. cursor page 3 (nextCursor should be null)', third);

  print('9. tasks grouped by status', await countTasksByStatus());
  print('10. totals', await getTaskTotals());
  void bobId;

  if (process.argv.includes('--cleanup')) {
    await cleanupDemoData();
    console.log('\nDemo data removed.');
  }
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.close());
