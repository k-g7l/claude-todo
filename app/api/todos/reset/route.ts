import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Test-only endpoint to wipe all todos between E2E test runs.
// Only active when APP_ENV === 'test'.
export function DELETE() {
  if (process.env.APP_ENV !== 'test') {
    return NextResponse.json({ error: 'not available' }, { status: 403 });
  }
  const db = getDb();
  db.prepare('DELETE FROM todos').run();
  db.prepare('DELETE FROM folders').run();
  return new NextResponse(null, { status: 204 });
}
