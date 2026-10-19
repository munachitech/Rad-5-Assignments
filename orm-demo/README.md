# ORM Demo

This project models users, projects, tasks, profiles, and tags with the Prisma 8 PostgreSQL contract in `src/prisma/contract.prisma`.

## Relationships

```text
User 1 ─── * Project
User 1 ─── * Task (owner)
User 1 ─── 0..* Task (assignee)
User 1 ─── 0..1 Profile
Project 1 ─── * Task
Task 1 ─── * TaskTag * ─── 1 Tag
```

`Task.owner` and `Task.assignee` are two distinct relationships to `User`. The supplied `User.tasks` field is the inverse of `Task.assignee`; `User.ownedTasks` is the additional inverse of `Task.owner`. Each task has one required owner, while its assignee is optional.

## Deletion behavior

- Deleting a project cascades to its tasks because a task cannot exist without its project.
- Deleting a task owner cascades to their owned tasks. Because the owner is required, this prevents tasks from being left without a valid owner. By contrast, the optional assignee uses `onDelete: SetNull`, so the task survives and can be reassigned.
- Deleting a user cascades to their profile because the profile has no independent identity.
- Deleting a task or tag cascades to its `TaskTag` rows, which only exist to connect those records.

## Constraints and storage

- `Profile.userId @unique` permits at most one profile per user; the required `userId` foreign key means each profile belongs to exactly one user. The inverse `User.profile` is optional, so a user may have no profile.
- `TaskTag` is an explicit many-to-many join model. `addedAt` records when a tag was attached, and the composite primary key `[taskId, tagId]` prevents duplicate links between the same task and tag.
- `@@type("pg/text@1")` stores the `Role`, `Status`, and `Priority` enum values using the PostgreSQL text codec.
- `temporal.updatedAt()` supplies update timestamps, and `@map`/`@@map` keep the TypeScript-facing camelCase names while storing fields and tables in snake_case.
- `@@index([projectId, status])` supports filtering tasks by project and status. The owner and assignee foreign keys and project owner foreign key are indexed as well.

## Prisma 8 workflow

The Prisma CLI loads `prisma.config.ts`. Contract generation and migration planning are offline; applying migrations requires a PostgreSQL connection. Set `DATABASE_URL` in the environment or in a local `.env` file before running `prisma db migrate`. The config deliberately leaves the database connection unset when that variable is absent.

To explain the design: “Users own projects and tasks. Each task belongs to a project, has one owner, and may have an assignee. A user may have one profile, and tasks connect to tags through a join table so the association can record when the tag was added.”
