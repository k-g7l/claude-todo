import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Todo } from '@/lib/types';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const body = await request.json();
  const hasCompleted = 'completed' in body;
  const hasFolderId = 'folder_id' in body;

  if (!hasCompleted && !hasFolderId) {
    return NextResponse.json({ error: 'completed or folder_id is required' }, { status: 400 });
  }

  if (hasCompleted && typeof body.completed !== 'boolean') {
    return NextResponse.json({ error: 'completed must be a boolean' }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(numId);
  if (!existing) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const setClauses: string[] = [];
  const values: (number | null)[] = [];

  if (hasCompleted) {
    setClauses.push('completed = ?');
    values.push(body.completed ? 1 : 0);
  }

  if (hasFolderId) {
    setClauses.push('folder_id = ?');
    values.push(body.folder_id ?? null);
  }

  values.push(numId);
  db.prepare(`UPDATE todos SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(numId) as Todo;
  return NextResponse.json({ ...updated, completed: Boolean(updated.completed) });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(numId);
  if (!existing) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  db.prepare('DELETE FROM todos WHERE id = ?').run(numId);
  return new NextResponse(null, { status: 204 });
}
