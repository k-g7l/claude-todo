import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Test-only endpoint to wipe all todos between E2E test runs.
// Only active when APP_ENV === 'test'.
export function DELETE(request: Request) {
  const resetSecret = request.headers.get('x-reset-secret');
  if (process.env.APP_ENV !== 'test' || resetSecret !== process.env.RESET_SECRET) {
    return NextResponse.json({ error: 'not available' }, { status: 403 });
  }
  const db = getDb();
  db.prepare('DELETE FROM todos').run();
  db.prepare('DELETE FROM folders').run();
  return new NextResponse(null, { status: 204 });
}
