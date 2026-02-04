# TableTalk - AI Restaurant Reservation System

A full-stack AI-driven restaurant reservation and event planning system built with React and FastAPI.

![TableTalk](https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop)

## Features

- 🍽️ **Restaurant Discovery** - Browse and search restaurants
- 📅 **Online Reservations** - Book tables with real-time availability
- 🤖 **AI Chat Assistant** - Conversational booking experience
- 🎉 **Corporate Events** - Plan and manage corporate dinners and banquets
- 📊 **Staff Dashboard** - Manage reservations and view analytics
- 🧠 **AI Recommendations** - Personalized restaurant and menu suggestions (powered by Gemini)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite, Framer Motion |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| AI | Google Gemini API |
| Auth | JWT |

## Project Structure

```
tabletalk/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── styles/             # CSS styles
│
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API routes
│   │   ├── services/       # Business logic
│   │   └── ai/             # AI services (Gemini)
│   └── scripts/            # Utility scripts
│
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: http://localhost:3000

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE tabletalk;
```

Update `backend/.env` with your database connection:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/tabletalk
GEMINI_API_KEY=your-gemini-api-key  # Optional, for AI features
```

Initialize database with sample data:

```bash
cd backend
python scripts/init_db.py
```

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Backend API runs at: http://localhost:8000
API Docs: http://localhost:8000/docs

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tabletalk.com | admin123 |
| Corporate | corp@company.com | corp123 |
| Customer | user@test.com | user123 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Restaurants
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/{id}` - Restaurant details with menu

### Reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - User's reservations
- `PUT /api/reservations/{id}` - Update reservation

### AI Features
- `POST /api/ai/recommend/restaurants` - Get AI recommendations
- `POST /api/ai/chat` - Chat with booking assistant
- `POST /api/ai/optimize/event` - Optimize event flow

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tabletalk
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

## Screenshots

### Home Page
Elegant landing page with restaurant information and booking CTA.

### Reservations
AI-powered chat assistant for conversational booking.

### Staff Dashboard
Manage reservations, view statistics, and handle bookings.

## License

MIT License
