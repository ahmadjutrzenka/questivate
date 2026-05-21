# Questivate

> A full-stack media collection tracker for anime, manga, and games — with AI-powered recommendations through **Vibe Check** and **Title Match**.

Questivate lets users curate their personal media library across three categories (anime, manga, games), track their progress and ratings, write reviews, and discover new titles through two AI-driven discovery features powered by Google Gemini.

### 🔗 Live Demo

- **App**: https://questiv8.vercel.app
- **API**: https://questivate-server.vercel.app

---

## ✨ Features

- **Personal Collections** — track anime, manga, and games with statuses (`plan`, `ongoing`, `completed`, `dropped`) and mark favorites
- **Reviews** — rate (0.5–10) and write reviews tied to each collection entry
- **Unified Search** — search across anime, manga, and games from external APIs (AniList for anime/manga, IGDB for games)
- **🎲 Vibe Check** — AI-powered recommendation that suggests media based on the user's mood or current vibe
- **🎯 Title Match** — given a single title, AI surfaces other media the user might enjoy with similar themes
- **Taste DNA** — AI-generated profile summary that describes the user's media taste based on their collection
- **Public User Profiles** — view other users' collections and reviews via `/users/:username`
- **Google OAuth Login** — login via Google in addition to local email/password
- **Avatar Upload** — profile pictures uploaded and served via Cloudinary

### 📱 Responsive UI Highlights

- **Mobile navbar** collapses into a **burger menu** for a clean, app-like feel on small screens
- The two flagship AI features (**Vibe Check** & **Title Match**) are surfaced via a **FAB radial menu** on the Dashboard — tap the floating action button to fan out the action options

---

## 🛠️ Tech Stack

### Frontend (`/client`)

- **React 19** with Vite as the build tool
- **Redux Toolkit** for state management (auth, collection, review, search, recommendation, tasteDna slices)
- **React Router v7** for client-side routing
- **Axios** for HTTP requests
- **@react-oauth/google** for Google Sign-In integration
- **React Toastify** for notifications
- **Vanilla CSS** (custom design — no UI framework)

### Backend (`/server`)

- **Node.js** + **Express 5**
- **Sequelize 6** ORM with **PostgreSQL**
- **JWT** authentication with **bcryptjs** password hashing
- **Cloudinary** for image hosting (avatars uploaded via base64 data URL pattern)
- **Multer** for multipart form parsing
- **Google Gemini AI** (`@google/genai`) for Vibe Check, Title Match, and Taste DNA generation
- **Google Auth Library** for verifying Google OAuth ID tokens
- **External APIs**: AniList GraphQL (anime & manga), IGDB (games)
- **Jest** + **Supertest** for testing

### Infrastructure

- **Frontend** deployed on **Vercel**
- **Backend** deployed on **Vercel** (serverless functions)
- **Database**: PostgreSQL hosted on **Supabase**

---

## 📁 Folder Structure

```
questivate/
├── client/                        # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js           # Redux store config
│   │   ├── assets/                # Fonts, images, SVGs
│   │   ├── components/            # Reusable components
│   │   │   ├── MediaCard.jsx
│   │   │   ├── Navbar.jsx         # Includes burger menu (mobile)
│   │   │   └── ReviewCarousel.jsx
│   │   ├── constants/
│   │   │   └── url.js             # API base URL constant
│   │   ├── features/              # Redux slices (manual thunk pattern)
│   │   │   ├── auth/
│   │   │   ├── collection/
│   │   │   ├── recommendation/
│   │   │   ├── review/
│   │   │   ├── search/
│   │   │   └── tasteDna/
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx     # Layout for /login & /register
│   │   │   └── MainLayout.jsx     # Layout for authenticated pages
│   │   ├── views/                 # Page-level components
│   │   │   ├── CollectionsPage.jsx
│   │   │   ├── DashboardPage.jsx  # Hosts the FAB radial menu
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MediaDetailPage.jsx
│   │   │   ├── OnboardingPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── TitleMatchPage.jsx
│   │   │   ├── UserProfilePage.jsx
│   │   │   └── VibeCheckPage.jsx
│   │   ├── App.jsx                # Route definitions
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                        # Node + Express backend
    ├── __tests__/                 # Jest test suites
    ├── bin/
    │   └── www.js                 # Local dev entry
    ├── config/
    │   └── config.json            # Sequelize env configs
    ├── controllers/
    │   ├── aiController.js        # Gemini AI features
    │   ├── AuthController.js
    │   ├── CollectionController.js
    │   ├── ReviewController.js
    │   ├── SearchController.js
    │   └── UserController.js
    ├── helpers/
    │   ├── bcrypt.js
    │   ├── externalApis.js        # AniList + IGDB integrations
    │   ├── gemini.js              # Gemini SDK wrapper
    │   └── jwt.js
    ├── middlewares/
    │   ├── authentication.js
    │   ├── authorization.js
    │   └── errorHandler.js
    ├── migrations/                # Sequelize migrations
    ├── models/
    │   ├── collection.js
    │   ├── index.js
    │   ├── review.js
    │   ├── tastedna.js
    │   └── user.js
    ├── routes/
    │   ├── ai.js
    │   ├── auth.js
    │   ├── collections.js
    │   ├── index.js
    │   ├── media.js
    │   ├── reviews.js
    │   ├── search.js
    │   └── users.js
    ├── seeders/
    ├── app.js                     # Express app (Vercel entry)
    ├── package.json
    └── vercel.json                # Vercel serverless config
```

---

## 🗄️ Data Model

- **User** — `username`, `email`, `password` (nullable for Google login), `loginMethod` (`local` | `google`), `avatar`, `bio`
- **Collection** — belongs to User. Tracks `mediaType` (`anime` | `manga` | `game`), `externalId`, `title`, `coverUrl`, `genres`, `synopsis`, `score`, `status`, `isFavorite`. Has a unique constraint on `(userId, externalId, mediaType)` — one user can't add the same title twice.
- **Review** — belongs to User & Collection (one-to-one with Collection). Has `rating` (0.5–10) and `content`.
- **TasteDNA** — belongs to User (one-to-one). AI-generated `content` summary plus `generatedAt` timestamp.

All associations cascade on delete.

---

## 🔌 API Endpoints

### Public

| Method | Endpoint                   | Description                                      |
| ------ | -------------------------- | ------------------------------------------------ |
| `POST` | `/auth/register`           | Register with email/password                     |
| `POST` | `/auth/login`              | Login with email/password                        |
| `POST` | `/auth/google-login`       | Login with Google OAuth                          |
| `GET`  | `/users`                   | List users                                       |
| `GET`  | `/users/:username`         | Public user profile + collections + reviews      |
| `GET`  | `/reviews/recent`          | Recent reviews across all users (Dashboard feed) |
| `GET`  | `/reviews/:id`             | Single review                                    |
| `GET`  | `/media/:type/:externalId` | Fetch external media details (anime/manga/game)  |

### Protected (requires JWT)

| Method   | Endpoint               | Description                           |
| -------- | ---------------------- | ------------------------------------- |
| `GET`    | `/auth/profile`        | Get current user's profile            |
| `PATCH`  | `/auth/profile`        | Update bio/username                   |
| `PATCH`  | `/auth/profile/avatar` | Upload new avatar (multipart)         |
| `GET`    | `/collections`         | Current user's collection             |
| `POST`   | `/collections`         | Add media to collection               |
| `GET`    | `/collections/:id`     | Get single collection entry           |
| `PATCH`  | `/collections/:id`     | Update status / favorite              |
| `DELETE` | `/collections/:id`     | Remove from collection                |
| `POST`   | `/reviews`             | Create review                         |
| `PATCH`  | `/reviews/:id`         | Update own review                     |
| `DELETE` | `/reviews/:id`         | Delete own review                     |
| `GET`    | `/search`              | Unified search (anime + manga + game) |
| `GET`    | `/search/popular`      | Popular media                         |
| `GET`    | `/search/detail`       | Media detail                          |
| `POST`   | `/ai/vibe-check`       | 🎲 Mood-based recommendation          |
| `POST`   | `/ai/title-match`      | 🎯 Similar-title recommendation       |
| `POST`   | `/ai/taste-dna`        | Generate Taste DNA profile            |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local) or a Supabase project
- Cloudinary account (for avatar uploads)
- Google Cloud OAuth credentials
- Google Gemini API key
- IGDB (Twitch) developer credentials

### 1. Clone

```bash
git clone https://github.com/ahmadjutrzenka/questivate.git
cd questivate
```

### 2. Server setup

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
JWT_SECRET_KEY=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GEMINI_API_KEY=your_gemini_key
IGDB_CLIENT_ID=your_igdb_client_id
IGDB_CLIENT_SECRET=your_igdb_client_secret
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
DATABASE_URL=postgresql://...   # only required in production
```

For local development, fill in the `development` block in `config/config.json` with your local Postgres credentials.

Then run migrations and seeders:

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
node bin/www.js
```

### 3. Client setup

```bash
cd ../client
npm install
```

Create a `.env` file in `/client`:

```env
VITE_API_BASE_URL="http://localhost:3000"
VITE_GOOGLE_CLIENT_ID="your_google_client_id"
```

Run the dev server:

```bash
npm run dev
```

---

## 🧪 Testing

The server has Jest test suites covering auth, collections, reviews, search, AI, and external APIs:

```bash
cd server
npm test
```

---

## 📦 Deployment

Both client and server are deployed as separate Vercel projects from the same monorepo:

- **Client**: Vercel project with `client` set as Root Directory. Framework preset: Vite. Environment variables: `VITE_API_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`.
- **Server**: Vercel project with `server` set as Root Directory. Uses `vercel.json` to route all requests to `app.js`. Requires all `.env` variables plus `NODE_ENV=production` and `DATABASE_URL` (Supabase connection string).

---

## 📸 Screenshots

_To be added._

---

## 📄 License

ISC
