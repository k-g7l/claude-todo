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

import { PATCH, DELETE } from '@/app/api/todos/[id]/route';
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

describe('PATCH /api/todos/:id', () => {
  it('marks a todo as completed', async () => {
    const { lastInsertRowid } = db
      .prepare("INSERT INTO todos (title, priority) VALUES ('Test', 'medium')")
      .run();
    const id = String(lastInsertRowid);

    const req = makeRequest(`http://localhost/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: true }),
    });
    const res = await PATCH(req, makeParams(id));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.completed).toBe(true);
  });

  it('marks a todo as incomplete', async () => {
    const { lastInsertRowid } = db
      .prepare("INSERT INTO todos (title, priority, completed) VALUES ('Test', 'medium', 1)")
      .run();
    const id = String(lastInsertRowid);

    const req = makeRequest(`http://localhost/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: false }),
    });
    const res = await PATCH(req, makeParams(id));
    const data = await res.json();
    expect(data.completed).toBe(false);
  });

  it('returns 404 for non-existent id', async () => {
    const req = makeRequest('http://localhost/api/todos/999', {
      method: 'PATCH',
      body: JSON.stringify({ completed: true }),
    });
    const res = await PATCH(req, makeParams('999'));
    expect(res.status).toBe(404);
  });

  it('returns 400 when completed is not boolean', async () => {
    const { lastInsertRowid } = db
      .prepare("INSERT INTO todos (title, priority) VALUES ('Test', 'medium')")
      .run();
    const id = String(lastInsertRowid);

    const req = makeRequest(`http://localhost/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: 'yes' }),
    });
    const res = await PATCH(req, makeParams(id));
    expect(res.status).toBe(400);
  });

  it('returns 400 when neither completed nor folder_id provided', async () => {
    const { lastInsertRowid } = db
      .prepare("INSERT INTO todos (title, priority) VALUES ('Test', 'medium')")
      .run();
    const id = String(lastInsertRowid);

    const req = makeRequest(`http://localhost/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
    const res = await PATCH(req, makeParams(id));
    expect(res.status).toBe(400);
  });

  it('updates folder_id assignment', async () => {
    const { lastInsertRowid: folderId } = db
      .prepare("INSERT INTO folders (name) VALUES ('Work')")
      .run();
    const { lastInsertRowid } = db
      .prepare('INSERT INTO todos (title, priority) VALUES (?, ?)')
      .run('Test', 'medium');
    const id = String(lastInsertRowid);

    const req = makeRequest(`http://localhost/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ folder_id: Number(folderId) }),
    });
    const res = await PATCH(req, makeParams(id));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.folder_id).toBe(Number(folderId));
  });

  it('clears folder_id when set to null', async () => {
    const { lastInsertRowid: folderId } = db
      .prepare("INSERT INTO folders (name) VALUES ('Work')")
      .run();
    const { lastInsertRowid } = db
      .prepare('INSERT INTO todos (title, priority, folder_id) VALUES (?, ?, ?)')
      .run('Test', 'medium', folderId);
    const id = String(lastInsertRowid);

    const req = makeRequest(`http://localhost/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ folder_id: null }),
    });
    const res = await PATCH(req, makeParams(id));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.folder_id).toBeNull();
  });
});

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo and returns 204', async () => {
    const { lastInsertRowid } = db
      .prepare("INSERT INTO todos (title, priority) VALUES ('Delete me', 'low')")
      .run();
    const id = String(lastInsertRowid);

    const req = makeRequest(`http://localhost/api/todos/${id}`, { method: 'DELETE' });
    const res = await DELETE(req, makeParams(id));
    expect(res.status).toBe(204);

    const remaining = db.prepare('SELECT * FROM todos WHERE id = ?').get(Number(id));
    expect(remaining).toBeUndefined();
  });

  it('returns 404 for non-existent id', async () => {
    const req = makeRequest('http://localhost/api/todos/999', { method: 'DELETE' });
    const res = await DELETE(req, makeParams('999'));
    expect(res.status).toBe(404);
  });
});
