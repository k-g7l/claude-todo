import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Folder } from '@/lib/types';

export function GET() {
  const db = getDb();
  const folders = db.prepare('SELECT * FROM folders ORDER BY name ASC').all() as Folder[];
  return NextResponse.json(folders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const db = getDb();

  const existing = db.prepare('SELECT id FROM folders WHERE name = ?').get(name.trim());
  if (existing) {
    return NextResponse.json({ error: 'folder already exists' }, { status: 400 });
  }

  const result = db.prepare('INSERT INTO folders (name) VALUES (?)').run(name.trim());
  const folder = db.prepare('SELECT * FROM folders WHERE id = ?').get(result.lastInsertRowid) as Folder;
  return NextResponse.json(folder, { status: 201 });
}
