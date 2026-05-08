import { createDb } from '@/lib/db';
import Database from 'better-sqlite3';

// Build an in-memory DB and inject it via module-level override
let db: Database.Database;

jest.mock('@/lib/db', () => {
  const actual = jest.requireActual('@/lib/db');
  return {
    ...actual,
    getDb: () => db,
  };
});

// Import after mock so they use the mock
import { GET, POST } from '@/app/api/todos/route';
import { NextRequest } from 'next/server';

function makeRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(url, options);
}

beforeEach(() => {
  db = createDb(':memory:');
});

afterEach(() => {
  db.close();
});

describe('GET /api/todos', () => {
  it('returns empty array when no todos', async () => {
    const req = makeRequest('http://localhost/api/todos?filter=all');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it('returns all todos', async () => {
    db.prepare("INSERT INTO todos (title, priority) VALUES ('Buy milk', 'low')").run();
    db.prepare("INSERT INTO todos (title, priority) VALUES ('Write tests', 'high')").run();

    const req = makeRequest('http://localhost/api/todos?filter=all');
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(2);
  });

  it('filters active todos', async () => {
    db.prepare("INSERT INTO todos (title, priority, completed) VALUES ('Done', 'low', 1)").run();
    db.prepare("INSERT INTO todos (title, priority, completed) VALUES ('Active', 'medium', 0)").run();

    const req = makeRequest('http://localhost/api/todos?filter=active');
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe('Active');
  });

  it('filters completed todos', async () => {
    db.prepare("INSERT INTO todos (title, priority, completed) VALUES ('Done', 'low', 1)").run();
    db.prepare("INSERT INTO todos (title, priority, completed) VALUES ('Active', 'medium', 0)").run();

    const req = makeRequest('http://localhost/api/todos?filter=completed');
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].completed).toBe(true);
  });

  it('returns completed as boolean', async () => {
    db.prepare("INSERT INTO todos (title, priority, completed) VALUES ('Item', 'medium', 0)").run();
    const req = makeRequest('http://localhost/api/todos');
    const res = await GET(req);
    const [item] = await res.json();
    expect(typeof item.completed).toBe('boolean');
    expect(item.completed).toBe(false);
  });
});

describe('GET /api/todos with folder filter', () => {
  it('returns only todos in the specified folder', async () => {
    const { lastInsertRowid: folderId } = db
      .prepare("INSERT INTO folders (name) VALUES ('Work')")
      .run();
    db.prepare('INSERT INTO todos (title, priority, folder_id) VALUES (?, ?, ?)').run(
      'In folder',
      'medium',
      folderId
    );
    db.prepare("INSERT INTO todos (title, priority) VALUES ('No folder', 'low')").run();

    const req = makeRequest(`http://localhost/api/todos?filter=all&folder=${folderId}`);
    const res = await GET(req);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe('In folder');
    expect(data[0].folder_id).toBe(Number(folderId));
  });
});

describe('POST /api/todos', () => {
  it('creates a todo and returns 201', async () => {
    const req = makeRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: 'New task', priority: 'high' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.title).toBe('New task');
    expect(data.priority).toBe('high');
    expect(data.completed).toBe(false);
  });

  it('defaults priority to medium', async () => {
    const req = makeRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: 'No priority' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.priority).toBe('medium');
  });

  it('stores due_date', async () => {
    const req = makeRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: 'Task', due_date: '2026-12-31', priority: 'low' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(data.due_date).toBe('2026-12-31');
  });

  it('returns 400 when title is missing', async () => {
    const req = makeRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ priority: 'low' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when title is blank', async () => {
    const req = makeRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: '   ' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('assigns todo to a folder when folder_id provided', async () => {
    const { lastInsertRowid: folderId } = db
      .prepare("INSERT INTO folders (name) VALUES ('Work')")
      .run();

    const req = makeRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: 'Work task', priority: 'high', folder_id: Number(folderId) }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.folder_id).toBe(Number(folderId));
  });

  it('returns 400 when folder_id does not exist', async () => {
    const req = makeRequest('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: 'Task', priority: 'medium', folder_id: 999 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
