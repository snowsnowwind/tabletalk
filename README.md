# TableTalk Frontend

AI-Powered Restaurant Reservation & Event Planning System

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Download from https://nodejs.org/)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
tabletalk/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx       # Main layout with navigation
│   │   ├── Layout.css
│   │   ├── RestaurantCard.jsx
│   │   └── RestaurantCard.css
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Landing page
│   │   ├── Discover.jsx     # Swipe-based restaurant discovery
│   │   ├── Recommendations.jsx  # AI recommendations grid
│   │   ├── RestaurantDetail.jsx # Restaurant details & reservation
│   │   ├── CorporateEvents.jsx  # Corporate event planning wizard
│   │   └── Preferences.jsx  # User preferences dashboard
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── styles/
│   │   └── index.css        # Global styles & design system
│   ├── App.jsx              # Main app with routing
│   └── main.jsx             # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## 🔌 Backend Integration

### API Configuration

Edit `src/services/api.js` to connect to your backend:

```javascript
// Change this to your backend URL
const API_BASE_URL = 'https://your-backend-url.ngrok-free.dev';

// Set to false when backend is available
const USE_MOCK_DATA = false;
```

### API Endpoints Used

The frontend expects these endpoints:

#### POST /recommend
Request:
```json
{
  "user_id": 1,
  "scenario": "dinner",
  "top_n": 6
}
```

Response:
```json
{
  "results": [
    {
      "id": 1,
      "name": "Restaurant Name",
      "cuisine": "Italian",
      "rating": 4.5,
      "price_level": 3,
      "score": 8.1,
      "reason": "AI recommendation reason"
    }
  ]
}
```

## 🎨 Features

### For Everyday Users
- **Swipe Discovery** - Tinder-style restaurant discovery
- **AI Recommendations** - Personalized suggestions by occasion
- **Restaurant Details** - Full info with reservation form
- **Preference Learning** - Cuisine, price, and ambiance preferences

### For Corporate Clients
- **Event Planning Wizard** - Step-by-step event setup
- **Menu Selection** - AI-recommended menus by budget
- **Event Flow Builder** - Drag-and-drop timeline
- **PDF Export** - Generate event summaries

## 🛠 Tech Stack

- **React 18** - UI framework
- **React Router 6** - Navigation
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Vite** - Build tool

## 📱 Responsive Design

The app is fully responsive:
- Mobile-first discovery experience
- Desktop-optimized corporate tools
- Tablet-friendly layouts

## 🎭 Design System

CSS variables for easy customization in `src/styles/index.css`:

```css
:root {
  --primary-500: #8b5cf6;  /* Main purple */
  --accent-400: #fbbf24;   /* Gold accent */
  --success: #10b981;      /* Green */
  --font-display: 'Playfair Display';
  --font-body: 'Inter';
}
```

## 📝 Next Steps

1. Install Node.js if not already installed
2. Run `npm install` to install dependencies
3. Update API_BASE_URL in `src/services/api.js`
4. Run `npm run dev` to start development
5. Connect with your backend team

## 🤝 Integration Checklist

- [ ] Update API base URL
- [ ] Set USE_MOCK_DATA to false
- [ ] Test /recommend endpoint
- [ ] Add authentication (if needed)
- [ ] Configure CORS on backend
