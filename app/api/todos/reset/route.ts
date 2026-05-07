import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Test-only endpoint to wipe all todos between E2E test runs.
// Only active when NODE_ENV !== 'production'.
export function DELETE() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'not available' }, { status: 403 });
  }
  getDb().prepare('DELETE FROM todos').run();
  return new NextResponse(null, { status: 204 });
}
