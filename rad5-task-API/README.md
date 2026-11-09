# Rad5 Student Task API

A simple REST API where each student has an account, manages their own tasks, and sets reminders (deadlines, study schedule, motivation notes).

**Stack:** Node.js, Express, PostgreSQL, Prisma, JWT, Zod

## Run it locally

1. Install Node.js and PostgreSQL. Create an empty database, e.g. `rad5_tasks`.
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `JWT_SECRET`.
4. `npm run migrate` (creates the tables; name it `init` when asked)
5. `npm run seed` (optional demo data: `ada@rad5.com` / `password123`)
6. `npm run dev`, then open http://localhost:5000

## Endpoints

Everything except register/login needs the header `Authorization: Bearer <token>`.

| Method | URL | What it does |
|---|---|---|
| POST | /api/auth/register | Create account (name, email, password) |
| POST | /api/auth/login | Log in, get a token |
| GET | /api/tasks | List my tasks. Filter: `?status=TODO` / `IN_PROGRESS` / `DONE` |
| GET | /api/tasks/:id | One task |
| POST | /api/tasks | Create task (title, description?, status?) |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/reminders | List my reminders. Filter: `?type=DEADLINE` / `STUDY` / `MOTIVATION` |
| GET | /api/reminders/due | Reminders that are due now and not done (poll this for in-app notifications) |
| POST | /api/reminders | Create reminder (message, remindAt, type?, taskId?) |
| PUT | /api/reminders/:id | Update, or dismiss with `{ "done": true }` |
| DELETE | /api/reminders/:id | Delete reminder |

### Quick test (curl)

```bash
# log in
curl -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"ada@rad5.com","password":"password123"}'

# create a task (paste your token)
curl -X POST localhost:5000/api/tasks -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Revise HTML forms","status":"TODO"}'

# set a study reminder
curl -X POST localhost:5000/api/reminders -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Study 7pm","type":"STUDY","remindAt":"2026-11-10T19:00:00Z"}'
```

## Folder guide

```
prisma/        schema.prisma (tables) + seed.js (demo data)
src/server.js  starts the app
src/routes/    which URL goes to which function
src/controllers/  the actual logic
src/middlewares/  login check, validation, errors
src/validators/   Zod rules
```

## Deploying

Pick one option. Check each platform's current pricing and free-tier limits, since they change.

### Option A: Render or Railway (no server setup)

1. Push the project to GitHub (`.env` is already in `.gitignore`, so your secrets stay out).
2. Create a PostgreSQL database on the platform, or use a separate one such as Neon or Supabase. Copy its connection string.
3. Create a new **Web Service** from your GitHub repo.
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables: `DATABASE_URL` (the connection string) and `JWT_SECRET` (a long random string). Do not set `PORT`, the platform sets it.
5. Create the tables once by running `npm run migrate:deploy` from the platform's shell, or add it to the build command: `npm install && npm run migrate:deploy`.
6. Open your public URL and test `GET /`. It should return `{"message":"Rad5 Task API is running"}`.

### Option B: Hostinger VPS

Hostinger's shared hosting generally does not run PostgreSQL, so use a **VPS**. Check your plan's current features before buying.

1. Create a VPS (Ubuntu). SSH in, install Node.js, PostgreSQL, Git and pm2.
2. Create the database and user in PostgreSQL.
3. `git clone` your repo, run `npm install`.
4. Create `.env` on the server (use a strong `JWT_SECRET`).
5. `npm run migrate:deploy`
6. `pm2 start src/server.js --name task-api` then `pm2 save`
7. Optional: put Nginx in front and point your domain to the VPS.

**Never run `npm run seed` in production.** It wipes all data.
