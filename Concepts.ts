# 📚 Express.js Module 7 — বিস্তারিত Concepts গাইড

> **লক্ষ্য:** একবার পড়লেই সব মনে পড়ে যাবে।
> প্রতিটি concept → বাংলা ব্যাখ্যা → real-life analogy → industry কোড।

---

## 7-1: Create Server with Express & TypeScript

### 🔵 বাংলা ব্যাখ্যা

**Express.js** হলো Node.js-এর একটি framework যেটি HTTP server তৈরি, routing, middleware — সব কিছু অনেক সহজ করে দেয়।

```
Pure Node.js:                     Express.js:
───────────────────────────────   ──────────────────────────────
if (url === '/users' &&           app.get('/users', handler)
    method === 'GET') { ... }
if (url === '/users' &&           app.post('/users', handler)
    method === 'POST') { ... }

Manual parsing, matching          Automatic — এক লাইনে
```

**TypeScript + Express কেন?**
```
JavaScript Express:               TypeScript Express:
req.body.naem  ← typo, no error  req.body.naem ← ❌ compile error!
                                  (name টাইপ করতে হবে)
```

### 💻 Real Project Setup

```bash
# Installation
npm install express
npm install -D typescript @types/express @types/node ts-node nodemon
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

```typescript
// src/app.ts — Express app configuration
import express, { Application } from 'express';
import userRoutes from './routes/userRoutes';

const app: Application = express();

// ── Built-in Middleware ──
app.use(express.json());                        // JSON body parse করে
app.use(express.urlencoded({ extended: true })); // Form data parse করে

// ── Request Logger Middleware ──
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ── Routes ──
app.use('/api/users', userRoutes);

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
```

```typescript
// src/server.ts — Server entry point
import app from './app';
import { config } from './config/env';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server বন্ধ হচ্ছে...');
  server.close(() => process.exit(0));
});
```

### ✅ কেন Express?
Pure Node.js-এ routing ম্যানুয়ালি করতে হয়। Express-এ `app.get('/users', handler)` — একটাই লাইন। Middleware system দিয়ে authentication, logging, CORS — সব সহজে যোগ করা যায়।

---

## 7-2: Understanding Express Request and Response

### 🔵 বাংলা ব্যাখ্যা

**Request (req)** = Client যা পাঠায় — URL, method, body, headers, cookies।
**Response (res)** = Server যা পাঠায় — status code, headers, JSON data।

```
Client                                    Server
──────                                    ──────
POST /api/users                   →       req.method = "POST"
Content-Type: application/json    →       req.headers
{ "name": "রহিম", "age": 25 }    →       req.body

                                  ←       res.status(201).json({...})
                                  ←       HTTP/1.1 201 Created
```

**req-এর সব জায়গা থেকে data আসে:**

```
URL: /api/users/42?role=admin&page=2
                │              │
                │              └── req.query  = { role: 'admin', page: '2' }
                └────────────────── req.params = { id: '42' }

Body: { "name": "রহিম" }
       └──────────────── req.body   = { name: 'রহিম' }

Headers: Authorization: Bearer xyz
          └─────────────────────── req.headers.authorization = 'Bearer xyz'
```

### 💻 Real Project Example

```typescript
// src/types/user.ts — TypeScript interfaces
export interface CreateUserBody {
  name: string;
  email: string;
  age?: number;
  role?: 'admin' | 'user' | 'moderator';
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  age?: number;
}

export interface UserParams {
  id: string;
}

export interface UserQuery {
  page?: string;
  limit?: string;
  role?: string;
  search?: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

```typescript
// src/controllers/userController.ts — Request & Response demo
import { Request, Response } from 'express';
import { CreateUserBody, UserParams, UserQuery } from '../types/user';

// TypeScript দিয়ে type-safe req & res
export const demoRequestData = (
  req: Request<UserParams, {}, CreateUserBody, UserQuery>,
  res: Response
) => {
  // ── req থেকে সব data ──
  console.log('Method:', req.method);           // GET, POST, PUT, DELETE
  console.log('URL:', req.url);                 // /api/users/42?role=admin
  console.log('Path:', req.path);               // /42
  console.log('Params:', req.params);           // { id: '42' }
  console.log('Query:', req.query);             // { role: 'admin', page: '2' }
  console.log('Body:', req.body);               // { name: 'রহিম', email: '...' }
  console.log('Headers:', req.headers);         // { content-type: 'application/json', ... }
  console.log('IP:', req.ip);                   // 127.0.0.1

  // ── res দিয়ে response পাঠানো ──

  // JSON response (সবচেয়ে বেশি ব্যবহার)
  res.status(200).json({
    success: true,
    message: 'Data received',
    received: {
      params: req.params,
      query: req.query,
      body: req.body,
    }
  });

  // অন্যান্য response types:
  // res.status(404).send('Not Found');        // Plain text
  // res.redirect('/api/users');               // Redirect
  // res.status(204).end();                    // No content (DELETE-এ)
};

// ── চেইন করা যায় ──
// res.status(201).json({...})
// res.set('X-Custom-Header', 'value').status(200).json({...})
```

### ✅ কেন গুরুত্বপূর্ণ?
`req.params`, `req.query`, `req.body` — এই তিনটার পার্থক্য না জানলে API থেকে সঠিক data আনা সম্ভব না। TypeScript দিয়ে type করলে typo-র কারণে bug আসে না।

---

## 7-3: Setting Up Postgres with Neon Serverless Cloud

### 🔵 বাংলা ব্যাখ্যা

**PostgreSQL** = Professional, reliable relational database। Production-এ সবচেয়ে বেশি ব্যবহৃত।

**Neon** = Serverless PostgreSQL — Cloud-এ free-তে PostgreSQL চালানো যায়। নিজের computer-এ install করতে হয় না।

```
Traditional Setup:              Neon Serverless:
─────────────────               ────────────────
1. PostgreSQL install করো       1. neon.tech-এ signup করো
2. User তৈরি করো                2. Database তৈরি করো
3. Database তৈরি করো            3. Connection string কপি করো
4. Config করো                   4. Done! ✅
5. চালু রাখো

জটিল + resource লাগে           সহজ + free + always on
```

### 💻 Real Project Setup

```bash
# Neon-এর জন্য pg package
npm install pg @neondatabase/serverless
npm install -D @types/pg
```

```
Neon Dashboard থেকে Connection String:
postgresql://username:password@ep-cool-name-123.us-east-2.aws.neon.tech/dbname?sslmode=require
```

```typescript
// src/config/db.ts — Database Connection Pool
import { Pool } from 'pg';
import { config } from './env';

// Pool = Connection-এর একটি group
// একবার তৈরি করো, বারবার reuse করো
const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false // Neon-এর জন্য দরকার
  },
  max: 20,               // সর্বোচ্চ ২০টি connection
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection test করো
pool.on('connect', () => {
  console.log('✅ Database connected!');
});

pool.on('error', (err) => {
  console.error('❌ Database error:', err.message);
});

// Database query করার helper function
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] Query: "${text.slice(0, 50)}..." | ${duration}ms | ${result.rowCount} rows`);
    return result.rows as T[];
  } catch (err: any) {
    console.error('[DB] Query error:', err.message);
    throw err;
  }
}

// Single row query
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

export default pool;
```

### ✅ কেন Neon?
Local PostgreSQL setup ছাড়াই cloud-এ free database। Team-এ সবাই একই database use করতে পারে। Production-ready SSL connection।

---

## 7-4: Explore SQL Data Types

### 🔵 বাংলা ব্যাখ্যা

SQL-এ প্রতিটি column-এর একটি নির্দিষ্ট **data type** থাকে। ভুল type ব্যবহার করলে:
- Storage waste হয়
- Performance কমে
- Data integrity নষ্ট হয়

```
TypeScript Type  →  SQL Type
────────────────────────────
string (short)   →  VARCHAR(255)
string (long)    →  TEXT
number (whole)   →  INTEGER / BIGINT / SERIAL
number (decimal) →  DECIMAL(10,2) / NUMERIC
boolean          →  BOOLEAN
Date             →  TIMESTAMP / TIMESTAMPTZ / DATE
object/array     →  JSONB
binary           →  BYTEA
UUID             →  UUID
```

### 💻 Real Project — SQL Types Table

```sql
-- ── Common PostgreSQL Data Types ──

-- 📝 Text Types
VARCHAR(100)    -- সর্বোচ্চ ১০০ character (name, email)
VARCHAR(255)    -- সর্বোচ্চ ২৫৫ character (URL, address)
TEXT            -- unlimited character (description, bio, content)
CHAR(2)         -- exactly 2 character (country code: 'BD', 'US')

-- 🔢 Number Types
SMALLINT        -- -32,768 to 32,767 (age, rating)
INTEGER         -- -2,147,483,648 to 2,147,483,647 (general numbers)
BIGINT          -- huge numbers (transaction amount in paisa)
SERIAL          -- auto-increment INTEGER (id column)
BIGSERIAL       -- auto-increment BIGINT
DECIMAL(10, 2)  -- 10 digits total, 2 after decimal (price: 99999999.99)
NUMERIC(15, 4)  -- precise calculations (tax, financial)

-- ✅ Boolean
BOOLEAN         -- true / false (is_active, is_verified)

-- 📅 Date & Time
DATE            -- শুধু তারিখ: 2024-01-15
TIME            -- শুধু সময়: 14:30:00
TIMESTAMP       -- তারিখ + সময়: 2024-01-15 14:30:00
TIMESTAMPTZ     -- timezone সহ (production-এ এটাই ভালো)

-- 🆔 Special
UUID            -- Universally Unique ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
JSONB           -- JSON data (structured but flexible)
ARRAY           -- array of values: INTEGER[], TEXT[]
```

```typescript
// TypeScript → PostgreSQL type mapping
interface User {
  id: number;             // SERIAL / INTEGER
  uuid: string;           // UUID
  name: string;           // VARCHAR(100)
  email: string;          // VARCHAR(255) UNIQUE
  bio: string | null;     // TEXT (nullable)
  age: number | null;     // SMALLINT
  salary: number;         // DECIMAL(12, 2)
  isActive: boolean;      // BOOLEAN
  role: string;           // VARCHAR(20) — 'admin' | 'user'
  preferences: object;    // JSONB
  createdAt: Date;        // TIMESTAMPTZ
  updatedAt: Date;        // TIMESTAMPTZ
}

// Corresponding SQL table:
/*
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  uuid        UUID DEFAULT gen_random_uuid() UNIQUE,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  bio         TEXT,
  age         SMALLINT CHECK (age > 0 AND age < 150),
  salary      DECIMAL(12, 2) DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  role        VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  preferences JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
*/
```

### ✅ কেন সঠিক type গুরুত্বপূর্ণ?
`price` column-এ `TEXT` ব্যবহার করলে `"99" > "100"` (alphabetical!) হয় — ভুল result। `DECIMAL(10,2)` ব্যবহার করলে সঠিক numerical comparison হয়।

---

## 7-5: Executing Pool and Creating Tables

### 🔵 বাংলা ব্যাখ্যা

**Connection Pool কী?**

```
Pool ছাড়া (প্রতি query-তে নতুন connection):
Request 1 → Connect → Query → Disconnect
Request 2 → Connect → Query → Disconnect   ← প্রতিবার connect slow!
Request 3 → Connect → Query → Disconnect

Pool দিয়ে (connection ready রাখা):
App start → 5টি connection তৈরি করো

Request 1 → Pool থেকে connection নাও → Query → Pool-এ ফেরত দাও
Request 2 → Pool থেকে connection নাও → Query → Pool-এ ফেরত দাও ← Fast!
Request 3 → Pool থেকে connection নাও → Query → Pool-এ ফেরত দাও
```

### 💻 Real Project Example

```typescript
// src/config/db.ts — Pool setup + Table creation
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                  // connection pool size
  idleTimeoutMillis: 30000, // idle connection কতক্ষণ রাখবে
  connectionTimeoutMillis: 5000, // connection নিতে max কতক্ষণ
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect(); // Pool থেকে connection নাও
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release(); // সবসময় pool-এ ফেরত দাও (finally block!)
  }
}

// ── Table তৈরি করা ──
export async function createTables(): Promise<void> {
  // UUID extension enable করো
  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(255) NOT NULL UNIQUE,
      age        SMALLINT,
      role       VARCHAR(20) DEFAULT 'user'
                 CHECK (role IN ('admin', 'user', 'moderator')),
      is_active  BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // Auto-update updated_at trigger
  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  await query(`
    DROP TRIGGER IF EXISTS set_updated_at ON users;
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at()
  `);

  // Index for faster email lookup
  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `);

  console.log('✅ Tables created successfully!');
}

// ── server.ts-এ call করো ──
// import { createTables } from './config/db';
// await createTables(); // server start হওয়ার আগে
```

```typescript
// src/server.ts — Pool + Tables initialize
import app from './app';
import { createTables } from './config/db';
import { config } from './config/env';

async function startServer() {
  try {
    // 1. Tables তৈরি করো
    await createTables();

    // 2. Server চালু করো
    app.listen(config.port, () => {
      console.log(`✅ Server running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

startServer();
```

### ✅ কেন Pool?
১০০০ concurrent request-এ ১০০০ DB connection তৈরি করলে PostgreSQL crash করবে। Pool-এ ১০টি connection রেখে ১০০০ request handle করা যায় — queue করে।

---

## 7-6: Creating Our First User with POST Method

### 🔵 বাংলা ব্যাখ্যা

**POST /api/users** = নতুন user তৈরি করো।

```
Flow:
Client → POST /api/users { name, email, age }
              │
              ▼
         Validate input
              │
              ▼
         Check duplicate email
              │
              ▼
         INSERT INTO users
              │
              ▼
         201 Created + new user data
```

### 💻 Real Project Example

```typescript
// src/controllers/userController.ts
import { Request, Response } from 'express';
import { query, queryOne } from '../config/db';
import { CreateUserBody, ApiResponse } from '../types/user';

// POST /api/users
export const createUser = async (
  req: Request<{}, ApiResponse, CreateUserBody>,
  res: Response<ApiResponse>
) => {
  try {
    const { name, email, age, role } = req.body;

    // ── 1. Validation ──
    const errors: string[] = [];
    if (!name || name.trim().length < 2) errors.push('name: কমপক্ষে ২ character দরকার');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email: valid email দিন');
    if (age !== undefined && (age < 1 || age > 120)) errors.push('age: 1-120 এর মধ্যে হতে হবে');

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: { errors } as any
      });
    }

    // ── 2. Duplicate email check ──
    const existing = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'এই email দিয়ে আগেই account আছে'
      });
    }

    // ── 3. INSERT query ──
    // $1, $2, $3 = Parameterized query (SQL injection থেকে রক্ষা!)
    const newUser = await queryOne(
      `INSERT INTO users (name, email, age, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, age, role, is_active, created_at`,
      [name.trim(), email.toLowerCase(), age || null, role || 'user']
    );

    // ── 4. Response ──
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });

  } catch (err: any) {
    console.error('createUser error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

```typescript
// src/routes/userRoutes.ts
import { Router } from 'express';
import { createUser } from '../controllers/userController';

const router = Router();

router.post('/', createUser);         // POST /api/users

export default router;
```

**⚠️ SQL Injection কেন Parameterized Query?**
```typescript
// ❌ NEVER — SQL Injection vulnerable!
const sql = `SELECT * FROM users WHERE email = '${email}'`;
// email = "'; DROP TABLE users; --" → database destroyed!

// ✅ ALWAYS — Parameterized (safe)
const sql = `SELECT * FROM users WHERE email = $1`;
await query(sql, [email]); // PostgreSQL নিরাপদে handle করে
```

**Test:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"রহিম আহমেদ","email":"rahim@email.com","age":28}'

# Response (201):
# { "success": true, "message": "User created successfully",
#   "data": { "id": 1, "name": "রহিম আহমেদ", "email": "rahim@email.com", ... } }
```

---

## 7-7: Getting All Users and Single User with Params

### 🔵 বাংলা ব্যাখ্যা

```
GET /api/users          → সব users (filter, sort, pagination সহ)
GET /api/users/5        → শুধু id=5 এর user
                ↑
                └── req.params.id = "5"  (URL-এ যা থাকে)
```

### 💻 Real Project Example

```typescript
// GET /api/users — সব users
export const getAllUsers = async (
  req: Request<{}, {}, {}, UserQuery>,
  res: Response<ApiResponse>
) => {
  try {
    const {
      page = '1',
      limit = '10',
      role,
      search
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // max 50
    const offset = (pageNum - 1) * limitNum;

    // Dynamic query builder
    const conditions: string[] = ['is_active = true'];
    const params: any[] = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      conditions.push(`role = $${paramCount}`);
      params.push(role);
    }

    if (search) {
      paramCount++;
      conditions.push(`(name ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      params.push(`%${search}%`); // ILIKE = case-insensitive LIKE
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Total count for pagination
    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult?.count || '0');

    // Actual data with pagination
    const users = await query(
      `SELECT id, name, email, age, role, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limitNum, offset]
    );

    return res.status(200).json({
      success: true,
      message: 'Users fetched',
      data: users as any,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/users/:id — একজন user
export const getUserById = async (
  req: Request<UserParams>,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;

    // ID validate করো
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const user = await queryOne(
      `SELECT id, name, email, age, role, is_active, created_at, updated_at
       FROM users
       WHERE id = $1 AND is_active = true`,
      [parseInt(id)]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User #${id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User found',
      data: user
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

```typescript
// Routes update
router.get('/', getAllUsers);       // GET /api/users
router.get('/:id', getUserById);   // GET /api/users/:id
```

**Test:**
```bash
# সব users
GET /api/users

# Filter + Pagination
GET /api/users?role=admin&page=1&limit=5

# Search
GET /api/users?search=রহিম

# Single user
GET /api/users/1
```

---

## 7-8: Update User with the PUT Method

### 🔵 বাংলা ব্যাখ্যা

```
PUT   /api/users/:id → Full replacement (সব field দিতে হয়)
PATCH /api/users/:id → Partial update (শুধু যা বদলাবে)

Production-এ PATCH বেশি user-friendly।
কিন্তু PUT শেখাটা foundation।
```

**Dynamic UPDATE query কেন?**
```
PUT: name + email + age সব পাঠাতে হয়
PATCH: শুধু name পাঠালেই হয়

Dynamic query বানাতে হয় কারণ:
UPDATE users SET name=$1              ← শুধু name
UPDATE users SET name=$1, email=$2    ← name + email
UPDATE users SET name=$1, age=$2, email=$3 ← সব
```

### 💻 Real Project Example

```typescript
// PUT /api/users/:id
export const updateUser = async (
  req: Request<UserParams, {}, UpdateUserBody>,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // ── 1. User আছে কিনা check ──
    const existing = await queryOne(
      'SELECT id FROM users WHERE id = $1 AND is_active = true',
      [parseInt(id)]
    );

    if (!existing) {
      return res.status(404).json({ success: false, message: `User #${id} not found` });
    }

    // ── 2. Validate ──
    if (name && name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'name too short' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    // ── 3. Email duplicate check (নিজেকে বাদ দিয়ে) ──
    if (email) {
      const emailExists = await queryOne(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), parseInt(id)]
      );
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already used' });
      }
    }

    // ── 4. Dynamic UPDATE query ──
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name.trim());
    }
    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email.toLowerCase());
    }
    if (age !== undefined) {
      paramCount++;
      updates.push(`age = $${paramCount}`);
      values.push(age);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'কোনো field দেওয়া হয়নি' });
    }

    paramCount++;
    values.push(parseInt(id));

    const updatedUser = await queryOne(
      `UPDATE users
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, name, email, age, role, updated_at`,
      values
    );

    return res.status(200).json({
      success: true,
      message: 'User updated',
      data: updatedUser
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

```typescript
router.put('/:id', updateUser);    // PUT /api/users/:id
```

**Test:**
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"রহিম আহমেদ চৌধুরী","email":"rahim.new@email.com"}'
```

---

## 7-9: Delete User with Delete Method

### 🔵 বাংলা ব্যাখ্যা

```
Hard Delete → সত্যিই DELETE করো (ফেরত আনা যাবে না)
Soft Delete → is_active = false করো (ফেরত আনা যাবে)

Production-এ Soft Delete বেশি ব্যবহার হয়:
- Audit trail থাকে (কে, কখন delete করেছে)
- Accidental delete থেকে রক্ষা
- Data recovery সম্ভব
```

### 💻 Real Project Example

```typescript
// DELETE /api/users/:id — Soft Delete
export const deleteUser = async (
  req: Request<UserParams>,
  res: Response<ApiResponse>
) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    // ── Soft Delete ──
    const deleted = await queryOne(
      `UPDATE users
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND is_active = true
       RETURNING id, name, email`,
      [parseInt(id)]
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: `User #${id} not found` });
    }

    return res.status(200).json({
      success: true,
      message: `User "${(deleted as any).name}" deleted`,
      data: deleted
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Hard Delete (শুধু admin-এর জন্য)
export const hardDeleteUser = async (
  req: Request<UserParams>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const result = await queryOne(
      'DELETE FROM users WHERE id = $1 RETURNING id, name',
      [parseInt(id)]
    );

    if (!result) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: `User permanently deleted`,
      data: result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

```typescript
router.delete('/:id', deleteUser);              // DELETE /api/users/:id
router.delete('/:id/permanent', hardDeleteUser); // admin only
```

---

## 7-10: Set Up Environment-based Configurations

### 🔵 বাংলা ব্যাখ্যা

```
❌ Code-এ hard-code করা (বিপদজনক!):
const DB_URL = "postgresql://user:mypassword@prod-server/db";
→ GitHub-এ push হলে password চুরি হবে!

✅ Environment variable (নিরাপদ):
const DB_URL = process.env.DATABASE_URL;
→ .env file-এ থাকে, .gitignore-এ add করা
```

**Different environments:**
```
Development (.env.development):   Production (.env.production):
PORT=3000                         PORT=8080
DATABASE_URL=localhost/dev_db     DATABASE_URL=neon-cloud/prod_db
LOG_LEVEL=debug                   LOG_LEVEL=error
NODE_ENV=development              NODE_ENV=production
```

### 💻 Real Project Example

```bash
# .env (git-এ নয়!)
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
JWT_SECRET=your-super-secret-key-minimum-32-chars
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_POOL_SIZE=10
```

```bash
# .env.example (git-এ রাখো — template)
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
JWT_SECRET=your-secret-here
ALLOWED_ORIGINS=http://localhost:5173
MAX_POOL_SIZE=10
```

```bash
# .gitignore
.env
.env.local
.env.development
.env.production
node_modules/
dist/
```

```typescript
// src/config/env.ts — Type-safe environment config
import dotenv from 'dotenv';
dotenv.config();

// ── Validation ──
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

// ── Config object (type-safe) ──
export const config = {
  port: parseInt(optionalEnv('PORT', '3000')),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  database: {
    url: requireEnv('DATABASE_URL'),  // Required!
    maxPoolSize: parseInt(optionalEnv('MAX_POOL_SIZE', '10')),
  },

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: optionalEnv('JWT_EXPIRES_IN', '7d'),
  },

  cors: {
    origins: optionalEnv('ALLOWED_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map(o => o.trim()),
  },
} as const;

// Startup-এ validate করো
console.log(`📦 Environment: ${config.nodeEnv}`);
console.log(`🔌 Port: ${config.port}`);
console.log(`🔗 DB: ${config.database.url.split('@')[1]?.split('/')[0] || 'configured'}`);
```

```typescript
// src/app.ts — CORS config with environment
import cors from 'cors'; // npm install cors @types/cors
import { config } from './config/env';

app.use(cors({
  origin: config.isProd ? config.cors.origins : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 7-11: Module Summary

### 🔵 সম্পূর্ণ Module-এর মূল কথা

```
Express + TypeScript (7-1)?
   npm install express @types/express
   app.use(), app.get(), app.post() — simple routing
   TypeScript দিয়ে type-safe req & res

Request & Response (7-2)?
   req.params  → URL-এ :id
   req.query   → URL-এ ?key=value
   req.body    → POST/PUT body (JSON)
   req.headers → Authorization, Content-Type
   res.status(200).json({...}) → response পাঠাও

Neon PostgreSQL (7-3)?
   Serverless cloud PostgreSQL — free
   Connection string → DATABASE_URL
   SSL required: rejectUnauthorized: false

SQL Data Types (7-4)?
   VARCHAR(n) → short text
   TEXT → long text
   SERIAL → auto-increment id
   DECIMAL(10,2) → price/money
   BOOLEAN → true/false
   TIMESTAMPTZ → date+time+timezone

Pool + Tables (7-5)?
   Pool = connection group, fast reuse
   CREATE TABLE IF NOT EXISTS → safe creation
   Parameterized query ($1, $2) → SQL injection থেকে রক্ষা

POST — Create (7-6)?
   Body parse → Validate → Duplicate check
   INSERT INTO ... RETURNING → new record ফেরত পাও
   201 Created status code

GET — Read (7-7)?
   SELECT * FROM users → সব
   WHERE id = $1 → একটি
   ILIKE '%search%' → case-insensitive search
   LIMIT + OFFSET → pagination

PUT — Update (7-8)?
   Dynamic SET clause → যা দেওয়া হয়েছে তাই update
   Email duplicate check নিজেকে বাদ দিয়ে (id != $2)
   RETURNING → updated record ফেরত পাও

DELETE — Remove (7-9)?
   Soft: is_active = false (production-এ best)
   Hard: DELETE FROM users (permanent)
   204 No Content বা 200 with deleted data

Environment Config (7-10)?
   .env file → dotenv.config()
   requireEnv() → missing হলে error
   .gitignore-এ .env যোগ করো
   config object → সব জায়গায় import করো
```

### 🗺️ Complete Request Flow

```
POST /api/users { name: "রহিম", email: "r@e.com" }
        │
        ▼
  app.ts — express.json() middleware (body parse)
        │
        ▼
  userRoutes.ts — router.post('/', createUser)
        │
        ▼
  userController.ts — createUser()
    ├── Validate input
    ├── Check duplicate
    │
    ▼
  db.ts — query(INSERT INTO users..., [$1, $2])
        │
        ▼
  Neon PostgreSQL — data save হলো
        │
        ▼
  res.status(201).json({ success: true, data: newUser })
        │
        ▼
  Client receives:
  { "success": true, "message": "User created",
    "data": { "id": 1, "name": "রহিম", ... } }
```

---

> 💡 **পরবর্তী কদম:** এখন তুমি Express + PostgreSQL দিয়ে full CRUD API বানাতে পারছ। পরের step হলো Authentication (JWT), Authorization (roles), এবং Middleware chain — এই দিয়ে Production-ready API সম্পূর্ণ হয়।