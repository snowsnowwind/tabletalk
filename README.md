# TableTalk - AI Restaurant Reservation System

A full-stack restaurant reservation and event planning platform with an AI-powered conversational booking assistant. Built with React and FastAPI.

## Overview

TableTalk helps customers discover restaurants, book tables, order food, and plan corporate events. The system features an AI chat assistant that guides users through the booking process conversationally, provides personalized restaurant and menu recommendations, and helps optimize event flows.

The platform supports three user roles - customers, corporate event planners, and restaurant staff - each with tailored interfaces and capabilities.

## Features

### Customer-facing
- **Restaurant Discovery** - Browse, search, and filter restaurants by cuisine, price level, and features
- **Online Reservations** - Book tables with real-time availability and past-date validation
- **AI Chat Assistant** - Conversational booking assistant that understands natural-language requests, builds a cart, and handles special requests
- **Menu Browsing & Ordering** - View restaurant menus with dietary filters (vegetarian, spicy, allergens), add items to cart, and check out
- **AI Recommendations** - Personalized restaurant and menu suggestions based on preferences, budget, and occasion
- **Dietary Preferences** - Save and manage dietary restrictions for personalized recommendations
- **Corporate Events** - Plan banquets and corporate dinners with AI-assisted event-flow optimization

### Staff tools
- **Staff Dashboard** - Manage reservations, view statistics, and handle bookings
- **Menu Management** - Add, edit, and toggle menu item availability
- **Event Management** - Review and manage corporate event requests

### System
- **JWT Authentication** - Secure token-based auth with role-based access control
- **Rate Limiting** - Public AI endpoints are rate-limited per client
- **Database-backed Context** - AI chat uses trusted restaurant/menu data from the database, not client-supplied catalog data
- **Transaction Safety** - Cart mutations (clear, remove) require explicit user intent; the AI cannot authorize cart changes alone

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, React Router 6, Framer Motion |
| Backend | Python FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL 14+ (SQLite supported for local testing) |
| AI | OpenCode Go API (DeepSeek V4 Flash), DeepSeek native API |
| Auth | JWT (python-jose), bcrypt password hashing |
| HTTP | Uvicorn ASGI server |

## Architecture

```
┌──────────────┐     HTTP/REST      ┌──────────────┐     SQLAlchemy      ┌────────────┐
│  React SPA   │ <────────────────> │  FastAPI     │ <────────────────> │ PostgreSQL │
│ (Vite dev)   │                    │  Backend     │                    │            │
└──────────────┘                    └──────┬───────┘                    └────────────┘
                                           │
                                           │  OpenAI-compatible API
                                           v
                                    ┌──────────────┐
                                    │  AI Service  │  (OpenCode Go / DeepSeek)
                                    └──────────────┘
```

The frontend is a single-page React application. The backend is a modular FastAPI app with routers for auth, restaurants, reservations, events, and AI. The AI layer wraps external LLM APIs behind a provider-switchable interface, and all chat context is rebuilt from the database on each request so the model only sees trusted restaurant/menu data.

## Project Structure

```
tabletalk/
├── src/                        # React frontend
│   ├── components/             # Reusable UI components (ChatBot, Layout, etc.)
│   ├── pages/                  # Page components (Home, Discover, Menu, etc.)
│   │   └── admin/              # Staff-only pages
│   ├── context/                # React context (CartContext)
│   ├── utils/                  # Helper utilities
│   ├── services/               # API client
│   └── styles/                 # Global styles
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── routers/            # API route handlers
│   │   ├── services/           # Business logic (auth)
│   │   ├── ai/                 # AI service providers and prompts
│   │   ├── config.py           # Settings via environment variables
│   │   ├── database.py         # DB session and init
│   │   └── main.py             # FastAPI app entry point
│   ├── scripts/                # DB init and migration scripts
│   ├── tests/                  # Pytest test suite
│   ├── requirements.txt
│   ├── .env.example            # Environment variable template
│   └── README.md               # Backend-specific docs
│
├── tests/                      # Frontend integration tests
├── public/                     # Static assets (images, favicon)
├── package.json
├── vite.config.js
└── README.md
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **PostgreSQL** 14+ (or use SQLite for local testing)

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Database setup

Create a PostgreSQL database:

```sql
CREATE DATABASE tabletalk;
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env      # Windows: copy .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/tabletalk
SECRET_KEY=generate-a-random-secret-string
OPENCODE_GO_API_KEY=your-opencode-go-api-key
```

Initialize the database with sample restaurants, menus, and test accounts:

```bash
cd backend
python scripts/init_db.py
```

### 4. Start the backend

```bash
cd backend
uvicorn app.main:app --reload --port 8570
```

- Backend API: http://localhost:8570
- Interactive API docs (Swagger UI): http://localhost:8570/docs

### 5. Start the frontend

```bash
npm run dev
```

Frontend runs at: http://localhost:3000

### Windows quick start (optional)

On Windows you can use the provided helper scripts to start and stop both services together:

```powershell
.\start-local.ps1   # starts frontend + backend
.\stop-local.ps1    # stops both
```

## Environment Variables

See `backend/.env.example` for the full list. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/tabletalk` |
| `SECRET_KEY` | JWT signing secret | - (must set) |
| `OPENCODE_GO_API_KEY` | API key for OpenCode Go AI provider | - (required for AI features) |
| `OPENCODE_GO_MODEL` | Model name | `deepseek-v4-flash` |
| `DEEPSEEK_API_KEY` | API key for native DeepSeek provider | - (optional, enables provider switching) |
| `HOST` / `PORT` | Backend bind address | `0.0.0.0:8570` |

## API Reference

Full interactive documentation is available at `/docs` (Swagger UI) and `/redoc` (ReDoc) once the backend is running.

### Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/restaurants` | List active restaurants |
| `GET` | `/api/restaurants/{id}` | Restaurant detail with menu |
| `POST` | `/api/reservations` | Create a reservation |
| `GET` | `/api/reservations` | List the user's reservations |
| `PUT` | `/api/reservations/{id}` | Update a reservation |
| `POST` | `/api/ai/recommend/restaurants` | AI restaurant recommendations |
| `POST` | `/api/ai/recommend/menu` | AI menu recommendations |
| `POST` | `/api/ai/chat` | Chat with the booking assistant |
| `POST` | `/api/ai/optimize/event` | AI event-flow optimization |
| `GET` | `/api/ai/status` | Check AI service status |

## Test Accounts

The database seed script (`scripts/init_db.py`) creates these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tabletalk.com | admin123 |
| Corporate | corp@company.com | corp123 |
| Customer | user@test.com | user123 |

## Running Tests

### Backend (pytest)

```bash
cd backend
.\venv\Scripts\activate       # or: source venv/bin/activate
pytest
```

The backend test suite covers reservation routes, schemas, AI provider switching, booking prompts, dietary preferences, and auth security.

### Frontend (integration tests)

```bash
npm test
```

## Key Design Decisions

- **Database-backed chat context** - The AI assistant never trusts restaurant/menu data sent from the browser. Each chat request rebuilds the context from the database, so the model only reasons over verified catalog data.
- **Explicit cart mutations** - Cart clear/remove operations are authorized by a deterministic intent checker, not by the model alone. The model can suggest a mutation, but the app applies it only when the user's message explicitly requests it.
- **Provider switching** - The AI layer supports multiple providers (OpenCode Go, DeepSeek) behind a common interface, selectable per request. New providers can be added by implementing the service interface.
- **Rate limiting** - Public AI endpoints enforce a per-client rate limit (20 requests/minute) to prevent abuse.

## License

MIT License
