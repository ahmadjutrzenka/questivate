[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=23654093&assignment_repo_type=AssignmentRepo)

# Individual Project Phase 2

# Questivate — Client

React SPA for Questivate, a cross-media tracking app for anime, manga, and games.

---

## Tech Stack

| Layer         | Library                     |
| ------------- | --------------------------- |
| Framework     | React 19 + Vite 8           |
| Routing       | React Router v7             |
| State         | Redux Toolkit + React Redux |
| HTTP          | Axios                       |
| Auth (Google) | @react-oauth/google         |
| Notifications | React Toastify              |
| Styling       | Vanilla CSS (`index.css`)   |

---

## Setup

```bash
cd client
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables)), then start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

`VITE_API_BASE_URL` falls back to `http://localhost:3000` if not set.

---

## Project Structure

```
src/
├── app/
│   └── store.js              # Redux store
├── assets/                   # Fonts, images, SVGs
├── components/
│   ├── MediaCard.jsx          # Reusable card for collection items
│   ├── Navbar.jsx             # Top navigation + user dropdown
│   └── ReviewCarousel.jsx     # Horizontal review feed + modal
├── constants/
│   └── url.js                 # BASE_URL constant
├── features/
│   ├── auth/authSlice.js
│   ├── collection/collectionSlice.js
│   ├── recommendation/recommendationSlice.js
│   ├── review/reviewSlice.js
│   ├── search/searchSlice.js
│   └── tasteDna/tasteDnaSlice.js
├── layouts/
│   ├── AuthLayout.jsx         # Redirects logged-in users away from auth pages
│   └── MainLayout.jsx         # Fetches profile, redirects unauthenticated users
├── views/                     # One file per page
└── main.jsx                   # App entry point
```

---

## Routes

| Path                       | View            | Auth                    |
| -------------------------- | --------------- | ----------------------- |
| `/login`                   | LoginPage       | Guest only              |
| `/register`                | RegisterPage    | Guest only              |
| `/oauth-callback`          | OAuthCallback   | Public                  |
| `/onboarding`              | OnboardingPage  | Public (requires token) |
| `/`                        | DashboardPage   | Required                |
| `/collections`             | CollectionsPage | Required                |
| `/search`                  | SearchPage      | Required                |
| `/vibe-check`              | VibeCheckPage   | Required                |
| `/title-match/:id`         | TitleMatchPage  | Required                |
| `/media/:type/:externalId` | MediaDetailPage | Required                |
| `/users/:username`         | UserProfilePage | Required                |
| `/profile`                 | ProfilePage     | Required                |
| `*`                        | —               | Redirects to `/`        |

**`AuthLayout`** — wraps `/login` and `/register`. Redirects to `/onboarding` if the user just registered (via `sessionStorage["new_registration"]`), otherwise to `/`.

**`MainLayout`** — wraps all protected pages. Redirects to `/login` if no `access_token` in localStorage, then fetches the user profile on mount.

---

## Redux State

### `auth`

```js
{
  user: null | { id, username, email, avatar, bio, loginMethod, TasteDNA },
  accessToken: null | "<jwt>",   // persisted in localStorage
  loading: false,
  error: ""
}
```

| Thunk                                 | Description                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `login(email, password)`              | POST `/auth/login`, stores token in localStorage                                 |
| `register(username, email, password)` | POST `/auth/register`, then calls `login` automatically                          |
| `googleLogin(googleToken)`            | POST `/auth/google-login`, sets `sessionStorage["new_registration"]` if new user |
| `fetchProfile()`                      | GET `/auth/profile`, populates `user`                                            |
| `logout()`                            | Clears localStorage and resets state                                             |

---

### `collection`

```js
{
  items: [],    // Collection[]
  loading: false,
  error: ""
}
```

| Thunk                        | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `fetchCollections(type?)`    | GET `/collections?type=...`                          |
| `addToCollection(payload)`   | POST `/collections`, returns `true` on success       |
| `updateCollection(id, body)` | PATCH `/collections/:id`, returns `true` on success  |
| `removeFromCollection(id)`   | DELETE `/collections/:id`, returns `true` on success |

All mutating thunks return a boolean so callers can show a toast on success/failure.

---

### `review`

```js
{
  reviews: [],  // Review[]
  loading: false,
  error: ""
}
```

| Thunk                       | Description                                                   |
| --------------------------- | ------------------------------------------------------------- |
| `fetchRecentReviews()`      | GET `/reviews/recent`                                         |
| `createReview(payload)`     | POST `/reviews`, prepends to state, returns `true` on success |
| `updateReview(id, payload)` | PATCH `/reviews/:id`, moves updated review to top of list     |
| `deleteReview(id)`          | DELETE `/reviews/:id`, removes from state                     |

---

### `search`

```js
{
  results: { anime: [], manga: [], game: [], users: [] },
  loading: false,
  error: ""
}
```

| Thunk / Action          | Description                    |
| ----------------------- | ------------------------------ |
| `searchMedia(q, type?)` | GET `/search?q=...&type=...`   |
| `clearResults()`        | Resets results to empty arrays |

---

### `recommendation`

```js
{
  vibeCheckResults: { anime: [], manga: [], game: [] },
  titleResults:     { anime: [], manga: [], game: [] },
  excludedThisSession: { anime: [], manga: [], game: [] },
  loading: false,
  error: ""
}
```

| Thunk / Action                                                   | Description                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| `fetchVibeCheck(referenceIds, targetMediaTypes, excludeTitles?)` | POST `/ai/vibe-check`                                         |
| `fetchTitleMatch(collectionId, excludeTitles?)`                  | POST `/ai/title-match`                                        |
| `addExcluded({ type, titles })`                                  | Accumulates titles to exclude in the next "Search again" call |
| `clearSession()`                                                 | Resets all recommendation state                               |

---

### `tasteDna`

```js
{
  content: null | "<string>",
  generatedAt: null | "<iso date>",
  loading: false,
  error: ""
}
```

| Thunk                | Description                                  |
| -------------------- | -------------------------------------------- |
| `generateTasteDNA()` | POST `/ai/taste-dna`, stores result in state |

---

## Pages

### LoginPage `/login`

Email/password login form + Google OAuth button. Errors shown via toast.

### RegisterPage `/register`

Username/email/password form. Sets `sessionStorage["new_registration"]` before dispatching, so `AuthLayout` redirects to `/onboarding` after login succeeds.

### OAuthCallback `/oauth-callback`

Handles token from URL query param (`?token=...`) for redirect-based OAuth flows. Stores token, dispatches `loginSuccess` + `fetchProfile`, then navigates to `/`.

### OnboardingPage `/onboarding`

First-run experience for new users. Shows popular anime, manga, and games (from `/search/popular`). Includes a search bar for finding specific titles. User must select at least 3 titles before continuing. Selected titles are batch-added to their collection, then the user is sent to `/`.

### DashboardPage `/`

Personal dashboard showing:

- Greeting + avatar + stats (anime/manga/game/review counts)
- TasteDNA excerpt
- Top genre breakdown (progress bars)
- Average ratings per media type
- Currently ongoing titles (up to 4)
- Recently added titles (up to 6)
- Recent community reviews (carousel)
- FAB (floating action button) with shortcuts to Vibe Check and Title Match

### CollectionsPage `/collections`

Full collection grid with tabs to filter by type (All / Anime / Manga / Game). Each card has:

- **Edit** — modal to update status and favorite flag
- **Review** — modal to create or edit a review
- **Title Match** — link to `/title-match/:id`

When navigated to with `?mode=title-match`, the Title Match button is highlighted to guide the user.

### SearchPage `/search`

Search bar with type tabs (All / Anime / Manga / Game / User). Media results shown in columns with an inline **+ Add** button. User results shown as a grid of avatar cards. Switching tabs clears previous results.

### VibeCheckPage `/vibe-check`

3-step AI recommendation flow:

1. **Pick references** — checklist of collection items grouped by type, with select-all per group and collapsible sections
2. **Choose output** — pick which media type(s) to receive recommendations for
3. **Results** — recommendation cards with cover, title, AI reason, and **+ Add to collection** button. Each section has a **Search again** button that excludes current results and re-queries Gemini.

### TitleMatchPage `/title-match/:id`

Shows AI recommendations similar to a single collection item (identified by its collection ID from the URL). Same recommendation card layout as Vibe Check. **Search again** per media type is supported.

### MediaDetailPage `/media/:type/:externalId`

Full detail page for an anime, manga, or game. Fetches directly from `/media/:type/:externalId` (public endpoint). Shows:

- Cover, title, score, genres
- Type-specific metadata (studios, episodes, authors, platforms, etc.)
- Synopsis and storyline (game only)
- All Questivate user reviews for that title
- **+ Add to collection** button (if not already in the user's collection)

### UserProfilePage `/users/:username`

Public profile view showing avatar, bio, join date, stats, favorites, TasteDNA, and the user's collections/reviews in tabs. If viewing your own profile, an **Edit profile** button appears that navigates to `/profile`.

### ProfilePage `/profile`

Settings page for the authenticated user:

- **Avatar** — file upload (sent as `multipart/form-data` to `/auth/profile/avatar`)
- **Bio** — textarea saved via PATCH `/auth/profile`
- **Taste DNA** — generate or regenerate via POST `/ai/taste-dna`
- **Favorites manager** — toggle up to 5 items as favorites from the full collection

---

## Components

### `MediaCard`

Displays a single collection item: cover image (links to media detail page), title, media type badge, score, status chip, and optional Edit/Remove action buttons. Action buttons only render when `onEdit` or `onRemove` props are provided.

### `Navbar`

Top navigation with links to Dashboard, Collections, Search, and Vibe Check. User avatar opens a dropdown with links to Public Profile, Settings, and a Logout button. Includes a burger menu for mobile viewports.

### `ReviewCarousel`

Horizontal scrollable feed of review cards. Each card shows the reviewer's avatar, username, media title, rating, and a truncated review excerpt. Clicking **Read full review** opens a modal with the full text and a **View media** button.

---

## Auth Flow

```
Register → sessionStorage["new_registration"] = "1"
         → login() dispatches loginSuccess(token)
         → AuthLayout checks sessionStorage → /onboarding
         → OnboardingPage removes sessionStorage key, adds 3+ titles
         → navigate("/")

Google Login → googleLogin(credential)
             → if isNewUser: sessionStorage["new_registration"] = "1"
             → same flow as above

Login (returning) → loginSuccess(token)
                  → AuthLayout → / (no sessionStorage key)

Logout → localStorage.removeItem("access_token")
       → logoutAction() → accessToken = null
       → MainLayout → /login
```

Access token is read from `localStorage` on app start (`authSlice` initialState). `MainLayout` calls `fetchProfile()` whenever `accessToken` changes.
