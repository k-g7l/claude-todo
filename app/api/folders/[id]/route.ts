import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM folders WHERE id = ?').get(numId);
  if (!existing) {
    return NextResponse.json({ error: 'invalid request' }, { status: 404 });
  }

  db.prepare('UPDATE todos SET folder_id = NULL WHERE folder_id = ?').run(numId);
  db.prepare('DELETE FROM folders WHERE id = ?').run(numId);
  return new NextResponse(null, { status: 204 });
}
