#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/22c5ecfb58cd1667c4cfeede9efcd39889cded8b993e7d3da9a5cde107e756e7/contract';
import endContract from '../../snapshots/22c5ecfb58cd1667c4cfeede9efcd39889cded8b993e7d3da9a5cde107e756e7/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'profiles',
        columns: [
          col('bio', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('user_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'projects',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('owner_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'tags',
        columns: [
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('label', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'task_tags',
        columns: [
          col('added_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('tag_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('task_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['task_id', 'tag_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'tasks',
        columns: [
          col('assignee_id', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('owner_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('priority', 'text', {
            notNull: true,
            default: lit('medium'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('project_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('todo'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'tasks_priority_check_ce55d8f4',
            sql`"priority" IN ('low', 'medium', 'high')`,
          ),
          checkExpression(
            'tasks_status_check_968994d8',
            sql`"status" IN ('todo', 'in_progress', 'done')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('user'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('users_role_check_b73ac96c', sql`"role" IN ('admin', 'user')`),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'profiles',
        constraint: 'profiles_user_id_key',
        columns: ['user_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'tags',
        constraint: 'tags_label_key',
        columns: ['label'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'projects',
        index: 'projects_owner_id_idx_ade9f347',
        columns: ['owner_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'task_tags',
        index: 'task_tags_tag_id_idx_94b47830',
        columns: ['tag_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'task_tags',
        index: 'task_tags_task_id_idx_5d5ac774',
        columns: ['task_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'tasks',
        index: 'tasks_assignee_id_idx_d45afe9c',
        columns: ['assignee_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'tasks',
        index: 'tasks_owner_id_idx_ade9f347',
        columns: ['owner_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'tasks',
        index: 'tasks_project_id_idx_6ad92603',
        columns: ['project_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'tasks',
        index: 'tasks_project_id_status_idx_edb0a78b',
        columns: ['project_id', 'status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'profiles',
        foreignKey: {
          name: 'profiles_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'projects',
        foreignKey: {
          name: 'projects_owner_id_fkey',
          columns: ['owner_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'task_tags',
        foreignKey: {
          name: 'task_tags_task_id_fkey',
          columns: ['task_id'],
          references: { schema: 'public', table: 'tasks', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'task_tags',
        foreignKey: {
          name: 'task_tags_tag_id_fkey',
          columns: ['tag_id'],
          references: { schema: 'public', table: 'tags', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'tasks',
        foreignKey: {
          name: 'tasks_project_id_fkey',
          columns: ['project_id'],
          references: { schema: 'public', table: 'projects', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'tasks',
        foreignKey: {
          name: 'tasks_owner_id_fkey',
          columns: ['owner_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'tasks',
        foreignKey: {
          name: 'tasks_assignee_id_fkey',
          columns: ['assignee_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
