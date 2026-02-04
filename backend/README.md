# TableTalk Backend

FastAPI backend for the TableTalk restaurant reservation system.

## Quick Start

### 1. Set up Python environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set up PostgreSQL

Make sure PostgreSQL is installed and running. Create a database:

```sql
CREATE DATABASE tabletalk;
```

### 3. Configure environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Update `.env` with:
- Your PostgreSQL connection string
- Your Gemini API key (optional, for AI features)
- A secure secret key for JWT

### 4. Initialize database

```bash
python scripts/init_db.py
```

This creates tables and adds sample data.

### 5. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at: http://localhost:8000

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login, get JWT token
- `GET /api/auth/me` - Get current user info

### Restaurants
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/{id}` - Get restaurant with menu
- `POST /api/restaurants` - Create restaurant (admin)
- `PUT /api/restaurants/{id}` - Update restaurant (admin)

### Reservations
- `GET /api/reservations` - Get user's reservations
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/{id}` - Get reservation details
- `PUT /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

### Corporate Events
- `GET /api/events` - Get user's events
- `POST /api/events` - Create event
- `GET /api/events/{id}` - Get event with flow
- `PUT /api/events/{id}` - Update event
- `POST /api/events/{id}/flow` - Add event flow step

### AI Features
- `POST /api/ai/recommend/restaurants` - Get restaurant recommendations
- `POST /api/ai/recommend/menu` - Get menu recommendations
- `POST /api/ai/optimize/event` - Optimize event flow
- `POST /api/ai/chat` - Chat with booking assistant
- `GET /api/ai/preferences` - Get user preference analysis

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tabletalk.com | admin123 |
| Corporate | corp@company.com | corp123 |
| Customer | user@test.com | user123 |
