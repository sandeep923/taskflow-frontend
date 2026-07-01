# TaskFlow 🚀

An AI-powered project management tool built with React, Node.js, and PostgreSQL. Manage your projects with a beautiful kanban board and generate tasks automatically using AI.

## 🌐 Live Demo

[TaskFlow Live](https://taskflow-frontend-git-main-sandeep923.vercel.app)

## ✨ Features

- 🔐 **JWT Authentication** — Secure login and register with bcrypt password hashing
- 📋 **Project Management** — Create, view, and delete projects with custom colors
- 🎯 **Kanban Board** — Drag and drop tasks between Todo, In Progress, and Done columns
- 🤖 **AI Task Generator** — Generate relevant tasks automatically using Groq's Llama AI
- 🔒 **Protected Routes** — Secure pages with automatic redirect for unauthenticated users
- 💾 **Persistent Login** — Stay logged in across page refreshes using localStorage
- 📱 **Fully Responsive** — Works perfectly on mobile, tablet, and desktop

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Tailwind CSS | Styling |
| Zustand | State management |
| Axios | API calls |
| React Router DOM | Navigation |
| dnd-kit | Drag and drop |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server |
| TypeScript | Type safety |
| PostgreSQL | Database |
| Prisma ORM | Database queries |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Groq AI (Llama) | AI task generation |

## 🚀 Getting Started

### Prerequisites
```
Node.js v18+
PostgreSQL
```

### Frontend Setup
```bash
git clone https://github.com/sandeep923/taskflow-frontend.git
cd taskflow-frontend
npm install
```

Create `.env.local`:
```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

### Backend Setup
```bash
git clone https://github.com/sandeep923/taskflow-backend.git
cd taskflow-backend
npm install
```

Create `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow"
JWT_SECRET="your-secret-key"
GROQ_API_KEY="your-groq-api-key"
PORT=3001
```

```bash
npx prisma db push
npm run dev
```

## 📡 API Endpoints

### Auth
```
POST /api/auth/register → Create account
POST /api/auth/login    → Login + get token
```

### Projects
```
GET    /api/projects      → Get all my projects
POST   /api/projects      → Create project
DELETE /api/projects/:id  → Delete project
```

### Tasks
```
GET    /api/tasks/:projectId → Get project tasks
POST   /api/tasks            → Create task
PATCH  /api/tasks/:id        → Update task status
DELETE /api/tasks/:id        → Delete task
```

### AI
```
POST /api/ai/generate-tasks → Generate tasks with AI
```

## 🗄️ Database Schema

```
User
├── id, name, email, password
└── projects[]

Project
├── id, name, description, color
├── userId (belongs to User)
└── tasks[]

Task
├── id, title, description
├── status (TODO/DOING/DONE)
├── priority (LOW/MEDIUM/HIGH)
└── projectId (belongs to Project)
```

## 🌐 Deployment

```
Frontend → Vercel
Backend  → Railway
Database → Railway PostgreSQL
```

## 📸 Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Kanban Board
![Kanban Board](screenshots/kanban.png)

## 👨‍💻 Author

**Sandeep Kumar Gupta**
- GitHub: [@sandeep923](https://github.com/sandeep923)
- Email: sandeepsg700@gmail.com
- Location: Kathmandu, Nepal

## 📄 License

MIT License
