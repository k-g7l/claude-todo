import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Todo, FilterStatus } from '@/lib/types';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = (searchParams.get('filter') ?? 'all') as FilterStatus;
  const folderParam = searchParams.get('folder');
  const folderId = folderParam !== null && folderParam !== '' ? Number(folderParam) : null;

  const db = getDb();

  const whereParts: string[] = [];
  const params: (number | string)[] = [];

  if (filter === 'active') {
    whereParts.push('completed = 0');
  } else if (filter === 'completed') {
    whereParts.push('completed = 1');
  }

  if (folderId !== null && !isNaN(folderId)) {
    whereParts.push('folder_id = ?');
    params.push(folderId);
  }

  const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT * FROM todos ${where} ORDER BY created_at DESC`)
    .all(...params) as Todo[];

  const todos = rows.map((r) => ({ ...r, completed: Boolean(r.completed) }));
  return NextResponse.json(todos);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const { title, due_date, priority, folder_id } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority !== undefined && !validPriorities.includes(priority as string)) {
    return NextResponse.json({ error: 'priority must be low, medium, or high' }, { status: 400 });
  }
  const resolvedPriority = validPriorities.includes(priority as string) ? priority : 'medium';

  if (due_date !== undefined && due_date !== null) {
    if (
      typeof due_date !== 'string' ||
      !ISO_DATE_RE.test(due_date) ||
      isNaN(Date.parse(due_date))
    ) {
      return NextResponse.json(
        { error: 'due_date must be a valid date in YYYY-MM-DD format' },
        { status: 400 }
      );
    }
  }

  if (folder_id !== undefined && folder_id !== null && typeof folder_id !== 'number') {
    return NextResponse.json({ error: 'folder_id must be a number' }, { status: 400 });
  }

  const db = getDb();

  let resolvedFolderId: number | null = null;
  if (folder_id !== undefined && folder_id !== null) {
    const folder = db.prepare('SELECT id FROM folders WHERE id = ?').get(folder_id as number);
    if (!folder) {
      return NextResponse.json({ error: 'invalid request' }, { status: 400 });
    }
    resolvedFolderId = folder_id as number;
  }

  const stmt = db.prepare(
    'INSERT INTO todos (title, due_date, priority, folder_id) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(title.trim(), due_date ?? null, resolvedPriority, resolvedFolderId);

  const todo = db
    .prepare('SELECT * FROM todos WHERE id = ?')
    .get(result.lastInsertRowid) as Todo;

  return NextResponse.json({ ...todo, completed: Boolean(todo.completed) }, { status: 201 });
}
