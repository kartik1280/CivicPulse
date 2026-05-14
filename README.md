# CivicPulse 🏙️  
*A Real-Time Community Help Chat Platform*

CivicPulse is a real-time civic engagement platform that enables citizens to **report, discuss, and track local issues** such as water shortages, road damage, electricity outages, and safety concerns — all organized into **city-based chat rooms**.

---

## 🚀 Live Demo

🌐 **Frontend (Vercel):** https://civic-pulse-ruby.vercel.app/  
⚙️ **Backend (Render):** https://civicpulse-rybs.onrender.com (connected via API)

--- 

## 🚀 Overview

Modern cities generate thousands of civic complaints daily, but there is **no unified, real-time communication system** for citizens to collaborate or raise awareness.

**CivicPulse solves this by:**
- Creating **city-specific discussion spaces**
- Enabling **real-time communication**
- Providing **issue categorization & visibility**
- Supporting **analytics for insights**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Tailwind CSS v3, React Router v6 |
| **State Management** | Redux Toolkit + Context API |
| **Authentication** | Firebase Authentication |
| **Real-Time** | Socket.IO |
| **Charts** | Recharts |
| **HTTP** | Axios |
| **Backend** | Node.js + Express + Socket.IO |
| **Data** | In-memory (no database) |
| **Weather API** | OpenWeatherMap |

---

## 📁 Project Structure


---

## Project Structure

```
CivicPulse/
├── server/              ← Express + Socket.IO backend
│   ├── server.js
│   └── package.json
├── src/
│   ├── contexts/        ← Firebase AuthContext
│   ├── store/           ← Redux slices
│   ├── components/      ← Shared UI components
│   ├── pages/           ← Route-level pages
│   ├── hooks/           ← useDebounce
│   ├── lib/             ← firebase.js, socket.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
└── README.md
```

---

## Setup

### Prerequisites
- Node.js 18+
- A Firebase project (free tier)
- An OpenWeatherMap API key (free tier)

### 1. Clone and install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_WEATHER_API_KEY` | OpenWeatherMap free API key |
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) |

#### Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project, enable **Authentication > Email/Password**
3. Project Settings > Your Apps > Add Web App
4. Copy the config values into your `.env`

#### OpenWeatherMap Setup
1. Sign up at [openweathermap.org](https://openweathermap.org/)
2. API Keys tab > copy your default key
3. Note: new keys may take up to 2 hours to activate

### 3. Run the app

**Terminal 1 — Backend:**
```bash
cd server
npm start
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Features

- Firebase Auth (email/password signup & login)
- 4 city rooms: Delhi, Mumbai, Bangalore, Chennai
- Real-time chat via Socket.IO
- Issue tags: Water, Road, Electricity, Safety, Other
- Edit/Delete own messages (inline)
- Upvote toggle on any message
- Paginated message history
- Debounced search + filter by tag
- Live weather widget (OpenWeatherMap)
- Analytics dashboard (Recharts)
- Dark mode (persisted to localStorage)
- All pages lazy-loaded

---

## Deployment

### Frontend to Vercel
1. Push to GitHub, import at [vercel.com](https://vercel.com/)
2. Framework preset: **Vite**
3. Add all `VITE_*` env vars in Vercel dashboard
4. Set `VITE_API_URL` to your Render backend URL

### Backend to Render
1. Create a Web Service at [render.com](https://render.com/)
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Copy the service URL to `VITE_API_URL` in Vercel

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `cd server && npm start` | Start backend |
| `cd server && npm run dev` | Backend with hot reload |
