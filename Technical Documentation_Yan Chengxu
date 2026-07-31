# Technical Documentation: TableTalk AI Restaurant Reservation System

**Author:** Yan Chengxu
**Date:** July 2026

---

## 1. Overview

### 1.1 Purpose

This document provides technical documentation for the TableTalk restaurant reservation system. It covers system architecture, data model, AI service design, safety mechanisms, API specifications, deployment procedures, and testing.

### 1.2 Scope

TableTalk is a full-stack web application that provides:
- Restaurant discovery and browsing
- Online table reservations with availability validation
- An AI-powered conversational booking assistant
- Menu browsing, cart, and checkout
- Corporate event planning with AI-assisted flow optimization
- A staff dashboard for reservation management

The system serves three user roles: customers, corporate event planners, and administrative staff.

### 1.3 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite 5 | Single-page application |
| **Routing** | React Router 6 | Client-side navigation |
| **Animation** | Framer Motion | UI transitions |
| **Backend** | Python FastAPI | RESTful API service |
| **ORM** | SQLAlchemy 2.0 | Database access layer |
| **Validation** | Pydantic 2 | Request/response schemas |
| **Database** | PostgreSQL 14+ | Relational data storage |
| **Auth** | python-jose + passlib | JWT issuance, bcrypt hashing |
| **AI** | OpenCode Go / DeepSeek API | LLM chat, recommendations |
| **Server** | Uvicorn | ASGI server |

---

## 2. System Architecture

### 2.1 Module Descriptions

| Module | Description | Key Files |
|--------|-------------|-----------|
| **Frontend SPA** | React UI: discovery, booking, cart, chat, staff dashboard | `src/` |
| **API Gateway** | FastAPI app, CORS, router registration, startup | `backend/app/main.py` |
| **Auth Service** | JWT creation/verification, password hashing, role checks | `backend/app/services/auth.py` |
| **Routers** | Endpoint handlers for auth, restaurants, reservations, events, AI | `backend/app/routers/` |
| **Models** | SQLAlchemy ORM definitions | `backend/app/models/` |
| **Schemas** | Pydantic request/response models | `backend/app/schemas/` |
| **AI Service** | LLM provider abstraction, prompt building, safety guards | `backend/app/ai/` |
| **Database** | Engine, session factory, init, seed data | `backend/app/database.py` |

### 2.2 Request Flow

```
Browser  --HTTP-->  Vite dev proxy  --/api-->  FastAPI  --SQLAlchemy-->  PostgreSQL
                                                            |
                                                            +--> AI Service --HTTPS--> LLM Provider
```

1. The React frontend sends requests to `/api/*` paths.
2. During development, Vite proxies `/api` to the FastAPI backend on port 8570.
3. FastAPI routes the request through the appropriate router.
4. Routers use SQLAlchemy sessions to read/write PostgreSQL.
5. AI router rebuilds chat context from the database, then calls the configured LLM provider.

---

## 3. Data Model

### 3.1 Entity Overview

| Entity | Table | Purpose |
|--------|-------|---------|
| **User** | `users` | Accounts with role-based access |
| **Restaurant** | `restaurants` | Restaurant catalog |
| **MenuItem** | `menu_items` | Dishes belonging to a restaurant |
| **Reservation** | `reservations` | Booking records |
| **CorporateEvent** | `corporate_events` | Event planning requests |
| **EventFlow** | `event_flows` | Ordered steps within an event |

### 3.2 Schema Details

#### User

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | Auto-increment |
| `email` | String(255) | Unique, indexed |
| `hashed_password` | String(255) | bcrypt hash |
| `name` | String(100) | Required |
| `phone` | String(20) | Optional |
| `role` | Enum | `admin`, `corporate`, `customer` |
| `is_active` | Boolean | Default `true` |
| `preferences` | JSON | AI preference learning |
| `created_at` / `updated_at` | DateTime | Timestamps |

#### Restaurant

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | - |
| `name` | String(200) | Required |
| `cuisine` | String(100) | Required |
| `rating` | Float | Default 4.0 |
| `price_level` | Integer | 1-5 |
| `images` | JSON | Array of URLs |
| `operating_hours` | JSON | Per-day open/close |
| `features` | JSON | Amenities list |
| `total_capacity` | Integer | Default 100 |
| `is_active` | Boolean | Default `true` |

#### MenuItem

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | - |
| `restaurant_id` | FK -> restaurants | Required |
| `name` | String(200) | Required |
| `category` | String(100) | e.g. `dim_sum`, `mains` |
| `price` | Float | Required, in HKD |
| `is_vegetarian` | Boolean | Dietary filter |
| `is_spicy` | Boolean | Dietary filter |
| `allergens` | JSON | Allergen list |
| `is_available` | Boolean | Toggle for stock |
| `order_count` | Integer | Popularity signal |

#### Reservation

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | - |
| `user_id` | FK -> users | Nullable (guest bookings) |
| `restaurant_id` | FK -> restaurants | Required |
| `date` | DateTime | Required |
| `time` | String(10) | `HH:MM` format |
| `guests` | Integer | Required |
| `status` | Enum | `pending`, `confirmed`, `seated`, `completed`, `cancelled`, `no_show` |
| `confirmation_code` | String(20) | Unique |
| `guest_name` / `guest_phone` / `guest_email` | String | Guest contact fallback |

#### CorporateEvent

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | - |
| `user_id` | FK -> users | Nullable |
| `restaurant_id` | FK -> restaurants | Optional |
| `name` | String(200) | Required |
| `event_type` | String(50) | e.g. `annual_dinner` |
| `expected_guests` | Integer | Required |
| `budget` / `estimated_cost` | Float | - |
| `menu_selection` | JSON | Item IDs |
| `status` | Enum | `draft` -> `pending_approval` -> `approved` -> `confirmed` -> `in_progress` -> `completed` |

#### EventFlow

| Field | Type | Notes |
|-------|------|-------|
| `id` | Integer PK | - |
| `event_id` | FK -> corporate_events | Required |
| `step_order` | Integer | Sequence position |
| `title` | String(100) | Required |
| `start_time` | String(10) | `HH:MM` |
| `duration_minutes` | Integer | Default 30 |
| `step_type` | String(50) | e.g. `arrival`, `dinner`, `speech` |
| `ai_suggestions` | JSON | AI-generated improvements |

### 3.3 Relationships

```
User 1---* Reservation *---1 Restaurant
User 1---* CorporateEvent *---1 Restaurant
CorporateEvent 1---* EventFlow
Restaurant 1---* MenuItem
```

---

## 4. AI Service Design

### 4.1 Provider Architecture

The AI layer uses a provider-switchable design. All providers implement a common interface defined by `OpenCodeGoAIService`; the DeepSeek provider extends it with different credentials and endpoints.

```
backend/app/ai/
├── __init__.py              # Provider registry: ai_services dict
├── opencode_go_service.py   # Base service, all logic
├── deepseek_service.py      # Subclass, overrides credentials
└── booking_prompts.py       # Versioned prompt builders
```

```python
# backend/app/ai/__init__.py
ai_services = {
    "opencode_go": ai_service,
    "deepseek": deepseek_ai_service,
}

def get_ai_service(provider: str):
    return ai_services[provider]
```

The chat endpoint selects a provider per request via the `provider` field, allowing runtime switching without redeployment.

### 4.2 Controlled Booking Prompt

The chat assistant uses a versioned system prompt (`controlled-v5-food-question-priority`) built by `build_controlled_booking_prompt`. The prompt enforces:

- **Scope**: answer restaurant, food, and dining questions freely; refuse unrelated long-form work (essays, code, homework).
- **Factuality**: for TableTalk-specific claims (menu, prices, allergens, hours, cart), use only the provided database context; never invent dishes, prices, or availability.
- **Action contract**: the model must return a JSON object with a fixed `action` enum.
- **Confirmation policy**: `complete` may only be returned after explicit user confirmation and when all required fields are present.
- **Cart integrity**: cart changes require a matching action (`cart_summary`, `remove_cart_item`, `clear_cart`); the model must never compute cart totals.

**Action enum:**

```
ask_date | ask_time | ask_guests | ask_name | ask_phone |
confirm_booking | complete | cancel_draft |
cart_summary | remove_cart_item | clear_cart | null
```

**Response schema returned by the model:**

```json
{
  "response": "Which date would you like to book?",
  "action": "ask_date",
  "extracted_data": { "date": "2026-08-15" },
  "clear_fields": [],
  "quick_replies": ["Today", "Tomorrow", "This Saturday"]
}
```

### 4.3 Database-backed Context

The chat endpoint does **not** trust restaurant, menu, or cart data sent from the browser. On each request, `build_database_backed_chat_context` rebuilds the context from the database:

1. Filters client-supplied booking fields to an allowlist (`restaurant_id`, `date`, `time`, `guests`, `name`, `phone`, `special_requests`).
2. Re-validates cart item IDs against the `menu_items` table and recomputes prices, subtotal, 10% service charge, and total.
3. Loads the full active restaurant catalog from the database.
4. Loads the selected restaurant's available menu items.

This means the LLM only reasons over verified catalog data, preventing prompt-injected or stale client data from influencing its responses.

### 4.4 Recommendation Endpoints

Two additional AI features use simpler single-turn prompts:

- **Restaurant recommendations** (`POST /api/ai/recommend/restaurants`): sends the restaurant catalog and user criteria (role, scenario, budget, cuisine, guest count) to the LLM, which returns a ranked JSON array.
- **Menu recommendations** (`POST /api/ai/recommend/menu`): sends a restaurant's menu and event details, returns a balanced menu selection with cost and notes.
- **Event optimization** (`POST /api/ai/optimize/event`): sends the current event flow, returns an optimized flow with suggestions and warnings.

All three fall back to deterministic heuristic implementations when the LLM is unavailable.

---

## 5. AI Safety and Transaction Control

Because the LLM can suggest actions that mutate state, the backend applies deterministic guards around every model response.

### 5.1 Deterministic Cart Handling

Before the request reaches the LLM, `handle_deterministic_cart_request` checks whether the user's message is a cart read or mutation:

- **Cart summary**: matched by keywords (`cart`, `basket`, `bill`, `subtotal`, 购物车). Returns a program-computed summary; the model never calculates totals.
- **Clear cart**: matched by intent (`clear`, `empty`, `remove all`, 清空). Negations (`don't clear`) and quoted mentions are excluded.
- **Remove item**: matched by verb (`remove`, `delete`, `take off`, 删除). The item is identified by name match against the database-backed cart.

If matched, the deterministic handler returns immediately and the LLM is not called. If the LLM later returns a cart action, `normalize_cart_model_action` re-checks that the user's original message explicitly requested it; otherwise the action is blocked.

### 5.2 Booking Confirmation Guards

`_normalize_booking_response` inspects every model response before it reaches the client:

- **Scope refusal**: if the message is a complex non-booking request (essay, code, homework), returns a scoped refusal.
- **Non-booking inquiries**: if the model returns a booking action (`ask_date`, `confirm_booking`, etc.) for a general question (weather, greeting, menu question), the action is downgraded to `null` so the booking state is not disturbed.
- **Confirmation enforcement**: `complete` is only allowed when the user explicitly confirms and all required fields (`restaurant_id`, `date`, `time`, `guests`, `name`, `phone`) are present.
- **Restaurant ID protection**: `restaurant_id` is stripped from `extracted_data`; the model cannot change the selected restaurant.
- **Field clearing**: `clear_fields` is restricted to a fixed set (`date`, `time`, `guests`, `name`, `phone`, `special_requests`).

### 5.3 Fallback Behavior

When the LLM is unavailable (missing API key, network error, invalid JSON), the service falls back to `_simple_chat_response`, a deterministic state machine that:

1. Detects cancellation and scope-refusal intents.
2. Handles general inquiries (greetings, time, weather) with fixed responses.
3. Extracts booking fields (date, time, guests, name, phone) via regex.
4. Asks for the first missing field in a fixed order.

This ensures the booking assistant remains functional even when the LLM provider is down.

### 5.4 Rate Limiting

Public AI endpoints apply a per-client-IP rate limit of 20 requests per 60 seconds, enforced by an in-memory sliding window (`check_public_ai_rate_limit`). Requests exceeding the limit receive `HTTP 429`.

### 5.5 Date Validation

Reservation creation rejects dates before the configured local booking date. The validation uses the `Asia/Hong_Kong` timezone in production and accepts an explicit `booking_date` context for anchored testing.

---

## 6. API Design

### 6.1 API Overview

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/register` | POST | Register a new user | None |
| `/api/auth/login` | POST | Login, receive JWT | None |
| `/api/auth/me` | GET | Current user profile | Required |
| `/api/restaurants` | GET | List active restaurants | None |
| `/api/restaurants/{id}` | GET | Restaurant detail with menu | None |
| `/api/restaurants/{id}/menu` | GET | Filtered menu by category | None |
| `/api/restaurants/menu/{id}` | PUT/DELETE | Update/delete menu item | Admin |
| `/api/reservations` | POST | Create reservation | Optional |
| `/api/reservations` | GET | List user's reservations | Required |
| `/api/reservations/{id}` | GET/PUT/DELETE | Read/update/cancel | Required |
| `/api/reservations/staff/all` | GET | All reservations (staff) | Admin |
| `/api/reservations/staff/{id}/status` | PUT | Update status | Admin |
| `/api/events` | GET/POST | List/create events | Corporate |
| `/api/events/{id}` | GET/PUT/DELETE | Event CRUD | Corporate |
| `/api/events/{id}/flow` | POST | Add event flow step | Corporate |
| `/api/ai/recommend/restaurants` | POST | AI restaurant recommendations | Rate-limited |
| `/api/ai/recommend/menu` | POST | AI menu recommendations | Rate-limited |
| `/api/ai/optimize/event` | POST | AI event-flow optimization | Required |
| `/api/ai/chat` | POST | Chat with booking assistant | Rate-limited |
| `/api/ai/preferences` | GET | User preference analysis | Required |
| `/api/ai/status` | GET | AI service status | None |

### 6.2 Request/Response Schemas

#### POST `/api/ai/chat`

**Request:**

```json
{
  "message": "I'd like to book a table for 4 tomorrow at 7pm",
  "conversation_history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "How can I help?" }
  ],
  "context": {
    "restaurant_id": 1,
    "cart": [ { "id": 7, "quantity": 1 } ]
  },
  "provider": "opencode_go"
}
```

**Response:**

```json
{
  "response": "Please confirm: 4 guests on 2026-08-01 at 19:00.",
  "action": "confirm_booking",
  "extracted_data": {
    "date": "2026-08-01",
    "time": "19:00",
    "guests": 4
  },
  "clear_fields": [],
  "quick_replies": ["Confirm booking", "Change date", "Cancel"]
}
```

#### POST `/api/auth/login`

**Request:**

```json
{ "email": "user@test.com", "password": "user123" }
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### 6.3 Authentication

- **Password storage**: bcrypt via passlib (`CryptContext(schemes=["bcrypt_sha256", "bcrypt"])`).
- **Token issuance**: HS256 JWT with `sub` (user ID) and `role` claims, 24-hour expiry.
- **Token validation**: `HTTPBearer` scheme; `get_current_user` decodes and loads the user.
- **Role enforcement**: `require_role` dependency factory; `require_admin` and `require_corporate` are pre-built.
- **Optional auth**: `get_current_user_optional` returns `None` instead of raising, used by endpoints that serve both authenticated and guest users.

### 6.4 Error Handling

| Status | Condition |
|--------|-----------|
| 400 | Invalid input, past-date booking |
| 401 | Missing or invalid token |
| 403 | Insufficient role, inactive user |
| 404 | Resource not found |
| 429 | AI rate limit exceeded |
| 500 | Unhandled server error |

---

## 7. Deployment Guide

### 7.1 Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

### 7.2 Installation

```bash
# Frontend
npm install

# Backend
cd backend
python -m venv venv
.\venv\Scripts\activate          # Windows
source venv/bin/activate          # macOS/Linux
pip install -r requirements.txt
```

### 7.3 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SECRET_KEY` | Yes | JWT signing secret |
| `OPENCODE_GO_API_KEY` | Yes* | OpenCode Go provider key |
| `OPENCODE_GO_MODEL` | No | Default `deepseek-v4-flash` |
| `DEEPSEEK_API_KEY` | No | Enables DeepSeek provider switching |
| `HOST` / `PORT` | No | Default `0.0.0.0:8570` |
| `DEBUG` | No | Default `true` |

*At least one AI provider key is required for AI features. Without keys, the system falls back to deterministic mode.

### 7.4 Database Initialization

```bash
cd backend
python scripts/init_db.py
```

This creates all tables, seeds 5 sample restaurants, 13 menu items, and 3 test accounts.

### 7.5 Running the Services

```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8570

# Frontend (separate terminal)
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8570
- Swagger docs: http://localhost:8570/docs

**Windows shortcut:** `.\start-local.ps1` starts both services; `.\stop-local.ps1` stops them.

---

## 8. Testing

### 8.1 Backend Tests

The backend includes a pytest suite in `backend/tests/`:

| Test File | Coverage |
|-----------|----------|
| `test_reservation_route.py` | Inactive restaurant rejection (404), placeholder phone rejection (400) |
| `test_reservation_schema.py` | Field validation: zero guests, time format, boolean guard, placeholder phone, past-date rejection, same-day acceptance |
| `test_ai_provider_switching.py` | Provider selection, fallback behavior |
| `test_booking_prompts.py` | Prompt builder output, version stability |
| `test_opencode_go_service.py` | Chat normalization, cart guards, scope refusal |
| `test_dietary_preferences.py` | Dietary filter logic |
| `test_auth_security.py` | JWT validation, password hashing, role checks |

Run with:

```bash
cd backend
pytest
```

### 8.2 Frontend Tests

Frontend integration tests live in `tests/`:

| Test File | Coverage |
|-----------|----------|
| `booking.test.mjs` | Booking flow, cart state transitions |
| `api.test.mjs` | API client request formatting and error handling |

Run with:

```bash
npm test
```

---

## 9. Integration Guide

### 9.1 Frontend API Client

The frontend uses a singleton `ApiService` (`src/services/api.js`) that manages:

- **Base URL**: reads `VITE_API_BASE_URL` from environment; defaults to same-origin (proxied by Vite to port 8570).
- **Auth token**: stored in `localStorage` under `authToken`; attached as `Authorization: Bearer <token>`.
- **401 handling**: clears the token on unauthorized responses.
- **Mock fallback**: `getMockRecommendations` provides sample data when the AI endpoint is unreachable.

```javascript
// Example: sending a chat message
const reply = await apiService.chatWithAssistant(
  "Book a table for 4 tomorrow at 7pm",
  conversationHistory,
  { restaurant_id: 1, cart: [{ id: 7, quantity: 1 }] },
  "opencode_go"
);
```

### 9.2 Chat Integration

The `ChatBot` component (`src/components/ChatBot.jsx`) drives the conversational booking flow:

1. Sends the user message plus conversation history and current context to `/api/ai/chat`.
2. Receives a response with `action`, `extracted_data`, `clear_fields`, and `quick_replies`.
3. Applies `extracted_data` to the local booking draft and clears fields listed in `clear_fields`.
4. Displays an application-authored review message when the model returns `complete`, so completion wording only appears after the reservation is actually persisted.
5. Renders `quick_replies` as clickable buttons for the next step.

Cart state is managed by `CartContext` (`src/context/CartContext.jsx`), which syncs with the backend's database-checked cart totals.

---

## 10. Future Extensions

| Feature | Description | Priority |
|---------|-------------|----------|
| Real-time availability | Live table-count tracking per time slot | High |
| Payment integration | Stripe / online deposit at booking | High |
| Multi-restaurant chain | Switch from single-tenant to multi-tenant | Medium |
| Push notifications | Booking reminders via email/SMS | Medium |
| Mobile app | React Native client | Medium |
| Analytics dashboard | Revenue and occupancy reporting | Low |

---

## 11. Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` on backend start | Activate venv and run `pip install -r requirements.txt` |
| Database connection refused | Verify PostgreSQL is running and `DATABASE_URL` is correct |
| AI chat returns fallback responses | Check `OPENCODE_GO_API_KEY` in `.env`; call `/api/ai/status` to verify |
| CORS errors in browser | Confirm the frontend origin is in `allow_origins` in `main.py` |
| `429 Too Many AI requests` | Rate limit (20/min) exceeded; wait or increase `PUBLIC_AI_REQUEST_LIMIT` |
| Menu images missing | Run `init_db.py`; the `sync_menu_images` step applies bundled dish images |

---

## Appendices

### A. API Reference Summary

```
AUTH
  POST   /api/auth/register           Register
  POST   /api/auth/login              Login
  GET    /api/auth/me                 Current user

RESTAURANTS
  GET    /api/restaurants             List restaurants
  GET    /api/restaurants/{id}        Restaurant + menu
  GET    /api/restaurants/{id}/menu   Menu by category
  PUT    /api/restaurants/menu/{id}   Update menu item (admin)
  DELETE /api/restaurants/menu/{id}   Delete menu item (admin)

RESERVATIONS
  POST   /api/reservations            Create
  GET    /api/reservations            List own
  GET    /api/reservations/{id}       Detail
  PUT    /api/reservations/{id}       Update
  DELETE /api/reservations/{id}       Cancel
  GET    /api/reservations/staff/all  All (admin)
  PUT    /api/reservations/staff/{id}/status  Update status (admin)

EVENTS
  GET    /api/events                  List own
  POST   /api/events                  Create
  GET    /api/events/{id}             Detail
  PUT    /api/events/{id}             Update
  DELETE /api/events/{id}             Delete
  POST   /api/events/{id}/flow        Add flow step

AI
  POST   /api/ai/recommend/restaurants  Recommendations
  POST   /api/ai/recommend/menu         Menu recommendations
  POST   /api/ai/optimize/event          Event optimization
  POST   /api/ai/chat                    Chat assistant
  GET    /api/ai/preferences             Preference analysis
  GET    /api/ai/status                  Service status

SYSTEM
  GET    /                              Root
  GET    /health                        Health check
  GET    /docs                          Swagger UI
  GET    /redoc                         ReDoc
```

### B. Project Directory Structure

```
tabletalk/
├── src/
│   ├── components/         ChatBot, Layout, RestaurantCard, StatusIndicator
│   ├── pages/              Home, Discover, Menu, Reservations, Cart, Checkout,
│   │   └── admin/          AdminLayout, Login, MenuManager
│   ├── context/            CartContext
│   ├── utils/              booking helpers
│   ├── services/           api.js (API client)
│   └── styles/             index.css
├── backend/
│   ├── app/
│   │   ├── models/         User, Restaurant, MenuItem, Reservation, CorporateEvent, EventFlow
│   │   ├── schemas/        Pydantic request/response models
│   │   ├── routers/        auth, restaurants, reservations, events, ai
│   │   ├── services/       auth.py (JWT, bcrypt, roles)
│   │   ├── ai/             opencode_go_service, deepseek_service, booking_prompts
│   │   ├── config.py       Settings via pydantic-settings
│   │   ├── database.py     Engine, session, init, seed
│   │   └── main.py         FastAPI app entry
│   ├── scripts/            init_db, migrations, reset_password
│   ├── tests/              pytest suite
│   ├── requirements.txt
│   └── .env.example
├── tests/                  Frontend integration tests
├── public/                 Static assets, menu images
├── package.json
└── vite.config.js
```
