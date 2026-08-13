# SkillSwap – Student Skill Exchange

A full-stack web app where college students list skills they can teach,
browse skills others are offering, and send/manage learning requests.

**Stack:** React (Vite) · Node.js / Express · MongoDB (Mongoose)

---

## 1. What's included

```
skillswap-app/
├── backend/                 Express + MongoDB REST API
│   ├── config/db.js         Mongo connection
│   ├── models/               User, Skill, Request (Mongoose schemas)
│   ├── routes/                users.js, skills.js, requests.js
│   ├── seed/seed.js           Sample data loader
│   └── server.js              App entry point
│
└── frontend/                 React + Vite client
    └── src/
        ├── api/client.js      Thin fetch wrapper for the API
        ├── context/            "active student" mock-auth context
        ├── components/         Navbar, SkillCard, StatCard, Avatar, states
        └── pages/               Dashboard, Profile, Explore, AddEditSkill,
                                   SkillDetails, MyRequests
```

### Pages
| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/` | Stats overview + recently added skills |
| Explore Skills | `/explore` | Search & filter all skill listings |
| Skill Details | `/skills/:id` | View a skill, its teacher, and send a request |
| Add/Edit Skill | `/skills/new`, `/skills/:id/edit` | Create or edit your own listing |
| My Requests | `/requests` | Manage requests you've sent / received |
| Student Profile | `/profile` | Edit your bio/availability, see your skills |

### How "login" works
There's no signup/password flow (out of scope for this brief). Instead, the
navbar has a **student switcher** — pick any seeded student to act as that
user. Everything (their skills, sent/received requests, profile) updates
accordingly. This is enough to fully exercise every feature. To turn this
into real authentication later, swap the `UserContext` for a JWT-based
login and protect the API routes with a `req.user` middleware — the routes
are already written to only need a user id, so the swap is mechanical.

---

## 2. Prerequisites

- Node.js 18+ and npm
- MongoDB running locally **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

## 3. Run it locally

### Step 1 — Start MongoDB
Either run MongoDB locally (`mongod`), or create a free Atlas cluster and
copy its connection string.

### Step 2 — Backend

```bash
cd backend
cp .env.example .env      # then edit MONGO_URI if needed
npm install
npm run seed               # loads sample students, skills & requests
npm run dev                 # starts the API on http://localhost:5000
```

You should see `SkillSwap API running on http://localhost:5000`.

### Step 3 — Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env      # defaults already point at localhost:5000/api
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**).

That's it — the app is fully wired up. Use the student switcher in the top
right to try different accounts, browse Explore, send a request, then log
in as the teacher (switch student) to accept/reject it from **My Requests**.

---

## 4. REST API reference

Base URL: `http://localhost:5000/api`

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/users` | List all students |
| GET | `/users/:id` | Get one student |
| POST | `/users` | Create a student profile |
| PUT | `/users/:id` | Update a profile |
| GET | `/users/:id/stats` | Dashboard stats for a student |

### Skills
| Method | Route | Description |
|---|---|---|
| GET | `/skills?search=&category=&level=&teacher=` | List / search / filter skills |
| GET | `/skills/meta/categories` | Valid categories & levels |
| GET | `/skills/:id` | Skill details incl. teacher |
| POST | `/skills` | Create a skill `{ title, description, category, level, teacher }` |
| PUT | `/skills/:id` | Edit a skill |
| DELETE | `/skills/:id` | Delete a skill (and its requests) |

### Requests
| Method | Route | Description |
|---|---|---|
| GET | `/requests?user=<id>&role=sent\|received` | List requests for a user |
| POST | `/requests` | Send a request `{ skillId, fromUser, message }` |
| PATCH | `/requests/:id/status` | `{ status: "Accepted" \| "Rejected" \| "Pending" }` |
| DELETE | `/requests/:id` | Withdraw/cancel a request |

All endpoints return JSON and appropriate HTTP status codes (`400`, `404`,
`409`, `500`) with a `message` field on error.

---

## 5. Sample data

`npm run seed` (run from `backend/`) wipes the database and inserts:

- 5 students (with bios, availability, colleges)
- 10 skills across Programming, Design, Music, Languages, Business,
  Academics and Arts & Crafts
- 5 sample learning requests in Pending / Accepted / Rejected states

Re-run it any time to reset the app to a clean demo state.

---

## 6. Deployment

**Backend** (Render, Railway, Fly.io, etc.)
1. Push the `backend/` folder as its own service (or set its root directory).
2. Set environment variables: `MONGO_URI` (Atlas connection string),
   `CLIENT_ORIGIN` (your deployed frontend URL), `PORT` (usually provided
   automatically by the host).
3. Start command: `npm start`. Run `npm run seed` once via the host's shell
   / one-off job to load sample data.

**Frontend** (Vercel, Netlify, etc.)
1. Deploy the `frontend/` folder.
2. Build command: `npm run build`. Output directory: `dist`.
3. Set `VITE_API_URL` to your deployed backend's `/api` URL, e.g.
   `https://your-api.onrender.com/api`.

**Database**: use MongoDB Atlas (free tier is enough) for any hosted
deployment — a local `mongod` won't be reachable from the internet.

---

## 7. Notes for extending

- Add real authentication (JWT + bcrypt) by replacing `UserContext`'s
  student switcher with a login form, and adding an `authMiddleware` that
  sets `req.user` in the backend.
- Add pagination to `GET /skills` for larger datasets (`?page=&limit=`).
- Add image uploads for profile avatars (currently generated from initials).
