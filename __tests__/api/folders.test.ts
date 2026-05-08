import { createDb } from '@/lib/db';
import Database from 'better-sqlite3';

let db: Database.Database;

jest.mock('@/lib/db', () => {
  const actual = jest.requireActual('@/lib/db');
  return {
    ...actual,
    getDb: () => db,
  };
});

import { GET, POST } from '@/app/api/folders/route';
import { DELETE } from '@/app/api/folders/[id]/route';
import { NextRequest } from 'next/server';

function makeRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(url, options);
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  db = createDb(':memory:');
});

afterEach(() => {
  db.close();
});

describe('GET /api/folders', () => {
  it('returns empty array when no folders', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it('returns folders after creation', async () => {
    db.prepare("INSERT INTO folders (name) VALUES ('Work')").run();
    db.prepare("INSERT INTO folders (name) VALUES ('Personal')").run();

    const res = await GET();
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data.map((f: { name: string }) => f.name)).toContain('Work');
    expect(data.map((f: { name: string }) => f.name)).toContain('Personal');
  });
});

describe('POST /api/folders', () => {
  it('creates a folder and returns 201', async () => {
    const req = makeRequest('http://localhost/api/folders', {
      method: 'POST',
      body: JSON.stringify({ name: 'Work' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe('Work');
    expect(data.id).toBeDefined();
  });

  it('returns 400 on blank name', async () => {
    const req = makeRequest('http://localhost/api/folders', {
      method: 'POST',
      body: JSON.stringify({ name: '   ' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 on missing name', async () => {
    const req = makeRequest('http://localhost/api/folders', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 on duplicate name', async () => {
    db.prepare("INSERT INTO folders (name) VALUES ('Work')").run();

    const req = makeRequest('http://localhost/api/folders', {
      method: 'POST',
      body: JSON.stringify({ name: 'Work' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

describe('DELETE /api/folders/:id', () => {
  it('removes a folder and returns 204', async () => {
    const { lastInsertRowid } = db.prepare("INSERT INTO folders (name) VALUES ('Work')").run();
    const id = String(lastInsertRowid);

    const req = makeRequest(`http://localhost/api/folders/${id}`, { method: 'DELETE' });
    const res = await DELETE(req, makeParams(id));
    expect(res.status).toBe(204);

    const remaining = db.prepare('SELECT * FROM folders WHERE id = ?').get(Number(id));
    expect(remaining).toBeUndefined();
  });

  it("sets todos' folder_id to null when folder is deleted", async () => {
    const { lastInsertRowid: folderId } = db
      .prepare("INSERT INTO folders (name) VALUES ('Work')")
      .run();
    db.prepare('INSERT INTO todos (title, priority, folder_id) VALUES (?, ?, ?)').run(
      'Task',
      'medium',
      folderId
    );

    const id = String(folderId);
    const req = makeRequest(`http://localhost/api/folders/${id}`, { method: 'DELETE' });
    await DELETE(req, makeParams(id));

    const todo = db.prepare('SELECT * FROM todos WHERE title = ?').get('Task') as {
      folder_id: number | null;
    };
    expect(todo.folder_id).toBeNull();
  });

  it('returns 404 for missing folder', async () => {
    const req = makeRequest('http://localhost/api/folders/999', { method: 'DELETE' });
    const res = await DELETE(req, makeParams('999'));
    expect(res.status).toBe(404);
  });
});
