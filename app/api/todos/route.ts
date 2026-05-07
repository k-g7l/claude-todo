import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Todo, FilterStatus } from '@/lib/types';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = (searchParams.get('filter') ?? 'all') as FilterStatus;

  const db = getDb();
  let rows: Todo[];

  if (filter === 'active') {
    rows = db.prepare('SELECT * FROM todos WHERE completed = 0 ORDER BY created_at DESC').all() as Todo[];
  } else if (filter === 'completed') {
    rows = db.prepare('SELECT * FROM todos WHERE completed = 1 ORDER BY created_at DESC').all() as Todo[];
  } else {
    rows = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all() as Todo[];
  }

  const todos = rows.map((r) => ({ ...r, completed: Boolean(r.completed) }));
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, due_date, priority } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const validPriorities = ['low', 'medium', 'high'];
  const resolvedPriority = validPriorities.includes(priority) ? priority : 'medium';

  const db = getDb();
  const stmt = db.prepare(
    'INSERT INTO todos (title, due_date, priority) VALUES (?, ?, ?)'
  );
  const result = stmt.run(title.trim(), due_date ?? null, resolvedPriority);

  const todo = db
    .prepare('SELECT * FROM todos WHERE id = ?')
    .get(result.lastInsertRowid) as Todo;

  return NextResponse.json({ ...todo, completed: Boolean(todo.completed) }, { status: 201 });
}
