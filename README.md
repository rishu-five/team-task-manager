<div align="center">

<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />

# 🚀 Team Task Manager

> **A production-grade, full-stack team collaboration platform** built with FastAPI, React, PostgreSQL, Redis, and Celery. Manage projects, track tasks, and keep your team aligned — all in one place.

---

</div>

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Admin-Only Onboarding** | Accounts are created exclusively by administrators — no public sign-up |
| 👥 **User Lifecycle Management** | Toggle users Active/Closed, promote members to admins, see who created each account |
| 📊 **Real-Time Dashboard** | Live-polling stats with task status & priority charts — refreshes every 5 seconds |
| 📁 **Project Management** | Full project lifecycle with member assignment, budget tracking, and status management |
| ✅ **Task Board** | Kanban-style task tracking with priority, story points, due dates, and comments |
| 🎨 **Multi-Theme & Multilingual** | Dark/Light mode + English, Hindi, Spanish, French translations |
| 🔑 **Role-Based Access Control** | Admins manage everything; members interact with their assigned projects |
| 📬 **Password Reset via OTP** | Email-based OTP flow for secure password recovery |
| 🎯 **Reward Points** | Gamified reward system to incentivize task completion |
| ⚡ **Background Jobs** | Celery + Redis for async task processing |
| 🐳 **Fully Dockerized** | One command to run the entire stack |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        CLIENT                            │
│          React 18 + TypeScript + Vite + Recharts         │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP / REST API
┌─────────────────────────▼────────────────────────────────┐
│                       BACKEND                            │
│     FastAPI (Python 3.11) — Clean Layered Architecture   │
│  Controllers → Services → Repositories → SQLAlchemy ORM  │
└──────┬────────────────────────────────────┬──────────────┘
       │                                    │
┌──────▼──────┐   ┌──────────────┐   ┌─────▼──────┐
│ PostgreSQL  │   │    Redis     │   │   Celery   │
│     DB      │   │ Cache/Queue  │   │  Workers   │
└─────────────┘   └──────────────┘   └────────────┘
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

### 2. Start the stack
```bash
docker-compose up --build
```

### 3. Access the application

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:5173 |
| 📖 API Docs (Swagger) | http://localhost:8000/docs |
| 📖 API Docs (ReDoc) | http://localhost:8000/redoc |

### 4. Create your first admin user

The first time you set up the app, use the Swagger docs at `http://localhost:8000/docs` to call `POST /api/v1/users/` with an admin token, or seed via the database directly:

```bash
# Access the backend container shell
docker exec -it ttm_backend bash

# Run a one-time seed script (optional)
python -c "
from app.db.session import SessionLocal
from app.services.user import create_user
from app.schemas.user import UserCreate

db = SessionLocal()
create_user(db, UserCreate(email='admin@example.com', password='admin123', full_name='Admin', role='admin'))
db.close()
print('Admin created!')
"
```

---

## 🚢 Production Deployment

### Option A: Single Server (Docker Compose)

This is the recommended approach for self-hosting on a VPS (DigitalOcean, Linode, AWS EC2, etc.).

#### Step 1: Provision a server
- Ubuntu 22.04 LTS recommended
- Minimum: 2 CPU, 2GB RAM

#### Step 2: Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose plugin
sudo apt-get install docker-compose-plugin -y
```

#### Step 3: Clone and configure
```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager

# Create your environment file from the template
cp .env.example .env
nano .env   # Fill in your values
```

**Edit `.env` with your actual values:**
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE
POSTGRES_DB=team_task_manager
SECRET_KEY=YOUR_VERY_LONG_RANDOM_SECRET_KEY
VITE_API_URL=http://YOUR_SERVER_IP:8000/api/v1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

> ⚠️ **Important**: To use Gmail SMTP, generate an [App Password](https://support.google.com/accounts/answer/185833) — do NOT use your main Gmail password.

#### Step 4: Deploy
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

#### Step 5: Verify
```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# View backend logs
docker compose -f docker-compose.prod.yml logs backend -f
```

Your app is now live:
- **Frontend**: `http://YOUR_SERVER_IP`
- **API**: `http://YOUR_SERVER_IP:8000/docs`

---

### Option B: Railway (PaaS — Backend Only)

The `railway.json` is pre-configured for Railway deployment of the **backend**.

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Create a new Railway project
```bash
railway init
```

#### Step 3: Add services in the Railway dashboard
1. Add a **PostgreSQL** service
2. Add a **Redis** service
3. Link them to your backend service

#### Step 4: Set environment variables in Railway dashboard
```
SECRET_KEY=your_long_secret_key
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

#### Step 5: Deploy
```bash
railway up
```

---

### Option C: Custom Domain with Nginx Reverse Proxy

For a professional setup with HTTPS:

#### Step 1: Install Nginx & Certbot
```bash
sudo apt-get install nginx certbot python3-certbot-nginx -y
```

#### Step 2: Configure Nginx
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;  # Frontend
    }

    location /api/ {
        proxy_pass http://localhost:8000;  # Backend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Step 3: Enable HTTPS
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 🔧 Environment Variables Reference

### Backend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@db:5432/dbname` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `SECRET_KEY` | JWT signing key (keep secret!) | `a_very_long_random_string` |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Email address | `you@gmail.com` |
| `SMTP_PASSWORD` | Email app password | `xxxx xxxx xxxx xxxx` |

### Frontend

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://your-server:8000/api/v1` |

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change `SECRET_KEY` to a long, random string: `python -c "import secrets; print(secrets.token_hex(32))"`
- [ ] Change `POSTGRES_PASSWORD` from the default
- [ ] Never commit your `.env` file to version control
- [ ] Add `.env` to `.gitignore`
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Set up firewall rules (only expose ports 80/443)

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── app/
│   │   ├── api/routes/        # FastAPI route handlers
│   │   ├── core/              # Config, security, celery
│   │   ├── db/                # Database session & base
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── repositories/      # Data access layer (CRUD)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── services/          # Business logic layer
│   ├── alembic/               # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios client & API services
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React context (Auth, Theme)
│   │   └── pages/             # Page-level components
│   ├── Dockerfile             # Production Nginx build
│   ├── Dockerfile.dev         # Development Vite server
│   └── nginx.conf             # Production Nginx config
├── docker-compose.yml         # Local development stack
├── docker-compose.prod.yml    # Production stack
├── .env.example               # Environment variable template
└── railway.json               # Railway PaaS config
```

---

## 🛠️ Development Guide

### Running individual services
```bash
# Backend only
docker-compose up backend db redis

# Frontend only (runs against a remote backend)
cd frontend && npm install && npm run dev

# Run database migrations manually
docker exec ttm_backend alembic upgrade head

# Generate a new migration
docker exec ttm_backend alembic revision --autogenerate -m "describe_your_change"
```

### Useful commands
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Access database
docker exec -it ttm_db psql -U admin -d team_task_manager

# Flush Redis cache
docker exec -it ttm_redis redis-cli FLUSHALL
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ using FastAPI, React, PostgreSQL, Redis, and Docker**

</div>
