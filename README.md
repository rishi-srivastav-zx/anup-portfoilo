# Cinematographer Portfolio & Studio Management System

A decoupled, production-ready Full-Stack architecture consisting of an independent Next.js App Router frontend and an Express.js + Neon PostgreSQL backend.

---

## 📁 Project Architecture

```text
portfolio-2/
├── frontend/                     # Standalone Next.js Frontend
│   ├── app/                      # Next.js App Router (inside src/app)
│   ├── public/                   # Static media, 3D models, textures, icons
│   ├── scripts/                  # Media generation & video conversion scripts
│   ├── src/
│   │   ├── api/                  # Centralized API client, services & config
│   │   ├── app/                  # App Router pages, layouts, and route handlers
│   │   ├── components/           # UI components, WebGL/Three.js canvases, shaders
│   │   ├── context/              # React Contexts (Auth, CookieConsent, Notification)
│   │   └── hooks/                # Custom React hooks (useApiHealth, useNetworkStatus)
│   ├── tests/                    # Frontend unit tests
│   ├── .env                      # Local frontend environment variables (gitignored)
│   ├── .env.example              # Frontend environment reference
│   ├── next.config.mjs           # Next.js compiler & routing configuration
│   ├── tailwind.config.js        # Tailwind CSS theme & animation configuration
│   ├── tsconfig.json             # TypeScript path mappings & compiler options
│   └── package.json              # Frontend dependencies and scripts
│
├── backend/                      # Standalone Express.js Backend
│   ├── src/
│   │   ├── config/               # DB connection (Neon PostgreSQL), env validation
│   │   ├── constants/            # App constants, intent classifications
│   │   ├── controllers/          # Request handlers (auth, blog, chat, enquiries)
│   │   ├── middleware/           # Auth guard, error handling, rate limiting
│   │   ├── migrations/           # Database schema migrations
│   │   ├── modules/              # Intent parsing & conversational modules
│   │   ├── repositories/         # Database persistence layers
│   │   ├── routes/               # Express API route declarations
│   │   ├── services/             # Business logic & background workers
│   │   ├── utils/                # Helper utilities, logger, sanitization
│   │   ├── validators/           # Zod input validation schemas
│   │   ├── workers/              # Blog scheduler worker
│   │   └── server.js             # Express application entrypoint
│   ├── tests/                    # Backend integration & unit tests
│   ├── .env                      # Local backend environment variables (gitignored)
│   ├── .env.example              # Backend environment reference
│   └── package.json              # Backend dependencies and scripts
│
├── README.md                     # Root project documentation & operational guide
└── .gitignore                    # Monorepo/multi-app Git ignore rules
```

---

## 🚀 Local Development

Both applications are completely decoupled and run independently.

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

- **Default Port:** `http://localhost:5000`
- **Health Check Endpoint:** `http://localhost:5000/api/health`
- **Database Migrations:** `npm run migrate`
- **Run Tests:** `npm test`

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

- **Default Port:** `http://localhost:3000`
- **Run Tests:** `npm test`
- **Production Build:** `npm run build`

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Local server port | `3000` |
| `NEXT_PUBLIC_SITE_URL` | Canonical client URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_BACKEND_URL`| Backend root URL | `http://localhost:5000` |
| `NEXT_PUBLIC_PORTFOLIO_EMAIL` | Contact recipient email | `Anooprawat123123@gmail.com` |

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Server listening port | `5000` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `DATABASE_URL` | Neon PostgreSQL pooled connection string | `postgresql://user:pass@host/db?sslmode=verify-full` |
| `ACCESS_TOKEN_SECRET` | 32+ character JWT secret | `[Secret Key]` |
| `ACCESS_TOKEN_EXPIRES_IN` | Token validity | `24h` |
| `REFRESH_TOKEN_DAYS` | Refresh cookie lifespan | `7` |
| `ACCESS_TOKEN_ISSUER` | JWT Issuer claim | `cinematographer-portfolio` |
| `ACCESS_TOKEN_AUDIENCE` | JWT Audience claim | `cinematographer-portfolio-client` |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | `[Public Key]` |
| `IMAGEKIT_PRIVATE_KEY`| ImageKit private key | `[Private Key]` |
| `IMAGEKIT_URL_ENDPOINT`| ImageKit CDN endpoint | `https://ik.imagekit.io/...` |

---

## 🌐 Production Deployment

### Frontend (Vercel)
- **Framework Preset:** `Next.js`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Environment Variables to add in Vercel:**
  - `NEXT_PUBLIC_SITE_URL`: `https://your-domain.com`
  - `NEXT_PUBLIC_API_URL`: `https://api.your-domain.com/api`
  - `NEXT_PUBLIC_BACKEND_URL`: `https://api.your-domain.com`
  - `NEXT_PUBLIC_PORTFOLIO_EMAIL`: `Anooprawat123123@gmail.com`

### Backend (Render / Railway / AWS / DigitalOcean / Fly.io)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start` (or `node src/server.js`)
- **Environment Variables to add:**
  - `NODE_ENV`: `production`
  - `PORT`: `5000` (or host assigned `$PORT`)
  - `FRONTEND_URL`: `https://your-domain.com`
  - `DATABASE_URL`: `postgresql://...`
  - `ACCESS_TOKEN_SECRET`: `[High-entropy 32+ character key]`
  - `ACCESS_TOKEN_EXPIRES_IN`: `24h`
  - `REFRESH_TOKEN_DAYS`: `7`
  - `ACCESS_TOKEN_ISSUER`: `cinematographer-portfolio`
  - `ACCESS_TOKEN_AUDIENCE`: `cinematographer-portfolio-client`
  - `IMAGEKIT_PUBLIC_KEY`: `...`
  - `IMAGEKIT_PRIVATE_KEY`: `...`
  - `IMAGEKIT_URL_ENDPOINT`: `...`
