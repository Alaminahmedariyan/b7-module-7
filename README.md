# 🚀 Module 7: Express.js Server Architecture & Database Integration

> Express.js + TypeScript দিয়ে Production-ready REST API তৈরি এবং PostgreSQL (Neon Serverless) Database-এর সাথে সংযোগ — শুরু থেকে শেষ পর্যন্ত।

---

## 📋 টপিক তালিকা

| # | টপিক | সময় |
|---|------|------|
| 7-1 | [Create Server with Express & TypeScript](#7-1-create-server-with-express--typescript) | 10 min |
| 7-2 | [Understanding Express Request and Response](#7-2-understanding-express-request-and-response) | 13 min |
| 7-3 | [Setting Up Postgres with Neon Serverless Cloud](#7-3-setting-up-postgres-with-neon-serverless-cloud) | 11 min |
| 7-4 | [Explore SQL Data Types](#7-4-explore-sql-data-types) | 10 min |
| 7-5 | [Executing Pool and Creating Tables](#7-5-executing-pool-and-creating-tables) | 9 min |
| 7-6 | [Creating Our First User with POST Method](#7-6-creating-our-first-user-with-post-method) | 12 min |
| 7-7 | [Getting All Users and Single User with Params](#7-7-getting-all-users-and-single-user-with-params) | 13 min |
| 7-8 | [Update User with the PUT Method](#7-8-update-user-with-the-put-method) | 13 min |
| 7-9 | [Delete User with Delete Method](#7-9-delete-user-with-delete-method) | 11 min |
| 7-10 | [Set Up Environment-based Configurations](#7-10-set-up-environment-based-configurations) | 6 min |
| 7-11 | [Module Summary](#7-11-module-summary) | 6 min |

---

## 🏗️ এই Module-এ যা তৈরি হবে

একটি সম্পূর্ণ **User Management REST API** — Express + TypeScript + PostgreSQL:

```
Client (Postman / Frontend)
           │
           │  HTTP Request
           ▼
┌──────────────────────────────────────┐
│         Express.js Server            │
│         (TypeScript)                 │
│                                      │
│  Middleware (JSON parser, Logger)    │
│          │                           │
│  Router                              │
│  ├── POST   /api/users  → Create     │
│  ├── GET    /api/users  → Read All   │
│  ├── GET    /api/users/:id → Read 1  │
│  ├── PUT    /api/users/:id → Update  │
│  └── DELETE /api/users/:id → Delete  │
│          │                           │
│  Controller (Business Logic)         │
└──────────────┬───────────────────────┘
               │  SQL Query
               ▼
┌──────────────────────────────────────┐
│   PostgreSQL (Neon Serverless)        │
│                                      │
│   Table: users                       │
│   id | name | email | created_at    │
└──────────────────────────────────────┘
```

---

## 🗂️ Final Project Structure

```
express-postgres-api/
├── README.md
├── concepts.md
├── .env                      ← Secrets (git-এ নয়)
├── .env.example              ← Template
├── .gitignore
├── package.json
├── tsconfig.json
└── src/
    ├── server.ts             ← Entry point
    ├── app.ts                ← Express app setup
    ├── config/
    │   └── db.ts             ← Database pool
    ├── routes/
    │   └── userRoutes.ts     ← Route definitions
    ├── controllers/
    │   └── userController.ts ← Business logic
    └── types/
        └── user.ts           ← TypeScript interfaces
```

---

## 💡 মূল ধারণাগুলো এক নজরে

| Concept | এক লাইনে |
|---------|----------|
| **Express** | Node.js-এর উপরে built, routing/middleware সহজ করে |
| **TypeScript + Express** | `@types/express` দিয়ে type-safe Express |
| **Request (req)** | Client থেকে আসা data — body, params, query, headers |
| **Response (res)** | Server থেকে পাঠানো data — status + JSON |
| **Middleware** | Request ও Response-এর মাঝখানে চলে |
| **Neon Postgres** | Serverless PostgreSQL — cloud-এ free DB |
| **Connection Pool** | একবার connect করে বারবার reuse করা |
| **SQL Data Types** | VARCHAR, INTEGER, BOOLEAN, TIMESTAMP, etc. |
| **CRUD** | Create, Read, Update, Delete |
| **dotenv** | `.env` file থেকে config লোড করা |

---

## 🔗 দ্রুত রিভিশনের জন্য

→ বিস্তারিত ব্যাখ্যা + কোড উদাহরণের জন্য দেখুন **[concepts.md](./concepts.md)**

---

## ⚡ Quick Setup

```bash
# Project তৈরি
mkdir express-postgres-api && cd express-postgres-api
npm init -y

# Dependencies
npm install express pg dotenv
npm install -D typescript ts-node @types/express @types/pg @types/node nodemon

# TypeScript config
npx tsc --init

# Run
npx nodemon src/server.ts
```

---

> 📁 **ফাইল স্ট্রাকচার:**
> ```
> express-postgres-api/
> ├── README.md      ← এই ফাইল (overview + quick reference)
> └── concepts.md    ← বিস্তারিত ব্যাখ্যা + real project কোড
> ```