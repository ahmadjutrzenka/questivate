[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=23654093&assignment_repo_type=AssignmentRepo)

# Individual Project Phase 2

# Questivate — Server

REST API for Questivate, a cross-media tracking app for anime, manga, and games. Built with Express.js + PostgreSQL + Sequelize.

---

## Tech Stack

| Layer         | Library                                  |
| ------------- | ---------------------------------------- |
| Runtime       | Node.js                                  |
| Framework     | Express 5                                |
| ORM           | Sequelize 6 + pg                         |
| Auth          | JWT (jsonwebtoken) + bcryptjs            |
| Google OAuth  | google-auth-library (`verifyIdToken`)    |
| File Upload   | Multer (memory storage) → Cloudinary     |
| AI            | @google/generative-ai (Gemini 2.0 Flash) |
| External APIs | Jikan v4 (anime/manga), IGDB (games)     |
| Testing       | Jest + Supertest                         |

---

## Setup

```bash
cd server
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables)), then run migrations and seeders:

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all   # optional
```

Start the server:

```bash
node bin/www.js
# or with nodemon:
npx nodemon bin/www.js
```

Default port: **3000**

---

## Environment Variables

```env
PORT=3000
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=questivate_db
DB_HOST=localhost

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

IGDB_CLIENT_ID=your_igdb_client_id
IGDB_CLIENT_SECRET=your_igdb_client_secret

GEMINI_API_KEY=your_gemini_api_key
```

---

## Database Models

| Model      | Key Fields                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------- |
| User       | id, username, email, password (hashed), avatar, bio, loginMethod                                |
| Collection | id, userId, mediaType, externalId, title, coverUrl, genres, synopsis, score, status, isFavorite |
| Review     | id, userId, collectionId, rating, content                                                       |
| TasteDNA   | id, userId, content, generatedAt                                                                |

---

## Error Response Format

All errors follow this shape:

```json
{
  "message": "Error description"
}
```

| Status | Name trigger         |
| ------ | -------------------- |
| 400    | `BadRequest`         |
| 401    | `Unauthorized`       |
| 403    | `Forbidden`          |
| 404    | `NotFound`           |
| 500    | unhandled / internal |

---

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The token is issued on login and contains `{ id, email }`.

---

## Endpoints

### Auth — `/auth`

#### POST `/auth/register`

Register a new local account.

**Auth:** none

**Request body:**

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `201`:**

```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "loginMethod": "local"
}
```

**Errors:**

- `400` — email already registered via Google

---

#### POST `/auth/login`

Login with email and password.

**Auth:** none

**Request body:**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`:**

```json
{
  "access_token": "<jwt>"
}
```

**Errors:**

- `400` — email or password missing
- `401` — invalid credentials, or account uses Google sign-in

---

#### POST `/auth/google-login`

Login or register via Google OAuth.

**Auth:** none

**Request header:**

```
access_token_google: <google_id_token>
```

**Response `200`:**

```json
{
  "access_token": "<jwt>",
  "isNewUser": true
}
```

`isNewUser: true` when the account was just created (use this to redirect to onboarding).

**Errors:**

- `400` — token missing or Google email not verified

---

#### GET `/auth/profile`

Get the authenticated user's profile including their TasteDNA.

**Auth:** required

**Response `200`:**

```json
{
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/...",
    "bio": "Loves dark fantasy and tactical RPGs.",
    "loginMethod": "local",
    "TasteDNA": {
      "content": "John gravitates toward...",
      "generatedAt": "2026-04-24T10:00:00.000Z"
    }
  }
}
```

`TasteDNA` is `null` if not yet generated.

---

#### PATCH `/auth/profile`

Update the authenticated user's bio.

**Auth:** required

**Request body:**

```json
{
  "bio": "Loves dark fantasy."
}
```

**Response `200`:**

```json
{
  "message": "Profile updated successfully",
  "bio": "Loves dark fantasy."
}
```

---

#### PATCH `/auth/profile/avatar`

Upload a new avatar image. Uploaded to Cloudinary, overwriting the previous one.

**Auth:** required

**Content-Type:** `multipart/form-data`

**Form field:** `avatar` (image file)

**Response `200`:**

```json
{
  "message": "Avatar updated successfully",
  "avatar": "https://res.cloudinary.com/..."
}
```

**Errors:**

- `400` — no file attached

---

### Users — `/users`

#### GET `/users`

List users, optionally filtered by username.

**Auth:** none

**Query params:**

| Param | Type   | Description                                |
| ----- | ------ | ------------------------------------------ |
| `q`   | string | Partial username search (case-insensitive) |

**Response `200`:**

```json
{
  "users": [{ "id": 1, "username": "john", "avatar": "https://..." }]
}
```

Max 20 results.

---

#### GET `/users/:username`

Get a user's public profile: info, stats, favorites, TasteDNA, and full collection.

**Auth:** none

**Response `200`:**

```json
{
  "user": {
    "id": 1,
    "username": "john",
    "avatar": "https://...",
    "bio": "Loves dark fantasy.",
    "joinedSince": "2026-04-21T00:00:00.000Z"
  },
  "stats": {
    "anime": 12,
    "manga": 5,
    "game": 8
  },
  "favorites": [
    {
      "id": 3,
      "title": "Berserk",
      "coverUrl": "https://...",
      "mediaType": "manga",
      "externalId": "2",
      "isFavorite": true
    }
  ],
  "tasteDNA": {
    "content": "John gravitates toward...",
    "generatedAt": "2026-04-24T10:00:00.000Z"
  },
  "collections": [
    {
      "id": 3,
      "title": "Berserk",
      "mediaType": "manga",
      "status": "ongoing",
      "Review": {
        "id": 1,
        "rating": 9.5,
        "content": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
  ]
}
```

`favorites` max 5. `tasteDNA` is `null` if not generated. `Review` inside each collection item is `null` if no review exists.

**Errors:**

- `404` — username not found

---

### Reviews — `/reviews`

#### GET `/reviews/recent`

Get the 20 most recently updated reviews across all users, with author and collection info.

**Auth:** none

**Response `200`:** Array of review objects.

```json
[
  {
    "id": 1,
    "rating": 9.5,
    "content": "A masterpiece.",
    "isEdited": false,
    "createdAt": "2026-04-24T09:00:00.000Z",
    "updatedAt": "2026-04-24T09:00:00.000Z",
    "User": { "id": 1, "username": "john", "avatar": "https://..." },
    "Collection": {
      "id": 3,
      "title": "Berserk",
      "coverUrl": "https://...",
      "mediaType": "manga",
      "externalId": "2"
    }
  }
]
```

`isEdited` is `true` when `updatedAt > createdAt`.

---

#### GET `/reviews/:id`

Get a single review by ID.

**Auth:** none

**Response `200`:** Same shape as a single item from `GET /reviews/recent`.

**Errors:**

- `404` — review not found

---

#### POST `/reviews`

Create a review for an item in the authenticated user's collection.

**Auth:** required

**Request body:**

```json
{
  "collectionId": 3,
  "rating": 9.5,
  "content": "A masterpiece."
}
```

Both `rating` and `content` are optional, but at least one must be provided.

**Response `201`:** The created review object.

**Errors:**

- `400` — both rating and content are missing
- `403` — the collection item doesn't belong to the authenticated user
- `404` — collection item not found

---

#### PATCH `/reviews/:id`

Update a review. Only the review owner can edit.

**Auth:** required

**Request body:**

```json
{
  "rating": 10,
  "content": "Changed my mind — perfect."
}
```

**Response `200`:** The updated review object with `isEdited` flag.

**Errors:**

- `403` — not the owner
- `404` — review not found

---

#### DELETE `/reviews/:id`

Delete a review. Only the review owner can delete.

**Auth:** required

**Response `200`:**

```json
{ "message": "Review deleted successfully" }
```

**Errors:**

- `403` — not the owner
- `404` — review not found

---

### Media — `/media`

#### GET `/media/:type/:externalId`

Get full media details from external API (Jikan for anime/manga, IGDB for games), plus all Questivate user reviews for that title.

**Auth:** none

**Path params:**

| Param        | Values                                 |
| ------------ | -------------------------------------- |
| `type`       | `anime`, `manga`, `game`               |
| `externalId` | MAL ID (anime/manga) or IGDB ID (game) |

**Response `200`:**

```json
{
  "mediaInfo": {
    /* raw Jikan or IGDB response object */
  },
  "reviews": [
    {
      "id": 1,
      "rating": 9.5,
      "content": "...",
      "isEdited": false,
      "User": { "id": 1, "username": "john", "avatar": "https://..." }
    }
  ]
}
```

`mediaInfo` shape differs by type — Jikan fields for anime/manga, IGDB fields for game.

**Errors:**

- `400` — invalid type
- `404` — media not found on external API

---

### Collections — `/collections`

All collection endpoints require authentication.

#### GET `/collections`

Get all collection items for the authenticated user.

**Auth:** required

**Query params:**

| Param  | Values                   | Description          |
| ------ | ------------------------ | -------------------- |
| `type` | `anime`, `manga`, `game` | Filter by media type |

**Response `200`:**

```json
{
  "collections": [
    {
      "id": 3,
      "mediaType": "manga",
      "externalId": "2",
      "title": "Berserk",
      "coverUrl": "https://...",
      "genres": ["Action", "Drama"],
      "synopsis": "...",
      "score": 9.2,
      "status": "ongoing",
      "isFavorite": true,
      "Review": {
        "id": 1,
        "rating": 9.5,
        "content": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
  ]
}
```

Ordered by `createdAt DESC`. `Review` is `null` if no review exists.

**Errors:**

- `400` — invalid type value

---

#### POST `/collections`

Add a media item to the authenticated user's collection.

**Auth:** required

**Request body:**

```json
{
  "mediaType": "manga",
  "externalId": "2",
  "title": "Berserk",
  "coverUrl": "https://...",
  "genres": ["Action", "Drama"],
  "synopsis": "...",
  "score": 9.2,
  "status": "plan"
}
```

`status` values: `plan`, `ongoing`, `completed`, `dropped`

**Response `201`:**

```json
{
  "collection": {
    /* created collection object */
  }
}
```

**Errors:**

- `400` — invalid mediaType, or title already in collection

---

#### GET `/collections/:id`

Get a single collection item by ID. Only the owner can access.

**Auth:** required + ownership check

**Response `200`:**

```json
{
  "collection": {
    /* collection object */
  }
}
```

**Errors:**

- `403` — not the owner
- `404` — not found

---

#### PATCH `/collections/:id`

Update status or favorite flag of a collection item. Only the owner can edit.

**Auth:** required + ownership check

**Request body:**

```json
{
  "status": "completed",
  "isFavorite": true
}
```

Both fields are optional. Favorites are capped at 5 per user.

**Response `200`:**

```json
{
  "collection": {
    /* updated collection object */
  }
}
```

**Errors:**

- `400` — already have 5 favorites
- `403` — not the owner
- `404` — not found

---

#### DELETE `/collections/:id`

Remove an item from the authenticated user's collection. Only the owner can delete.

**Auth:** required + ownership check

**Response `200`:**

```json
{ "message": "Collection 3 has been deleted" }
```

**Errors:**

- `403` — not the owner
- `404` — not found

---

### Search — `/search`

All search endpoints require authentication.

#### GET `/search/popular`

Get top 3 popular titles per media type from external APIs.

**Auth:** required

**Response `200`:**

```json
{
  "anime": [
    {
      "externalId": "5114",
      "title": "Fullmetal Alchemist: Brotherhood",
      "coverUrl": "https://...",
      "score": 9.1,
      "genres": ["Action", "Adventure"],
      "synopsis": "...",
      "mediaType": "anime"
    }
  ],
  "manga": [
    /* same shape */
  ],
  "game": [
    /* same shape */
  ]
}
```

---

#### GET `/search`

Unified search across anime, manga, games, and users.

**Auth:** required

**Query params:**

| Param  | Values                                  | Description                                |
| ------ | --------------------------------------- | ------------------------------------------ |
| `q`    | string                                  | Search query. Required unless `type=user`. |
| `type` | `all`, `anime`, `manga`, `game`, `user` | Default: `all`                             |

**Response `200`:**

```json
{
  "anime": [
    /* media result objects */
  ],
  "manga": [
    /* media result objects */
  ],
  "game": [
    /* media result objects */
  ],
  "users": [{ "id": 1, "username": "john", "avatar": "https://..." }]
}
```

When `type` is a specific media type, only that key is populated. Searching `type=user` with no `q` returns all users.

**Errors:**

- `400` — `q` missing (when type is not `user`), or invalid type

---

#### GET `/search/detail`

Get normalized detail for a single media item from external APIs.

**Auth:** required

**Query params:**

| Param  | Values                   |
| ------ | ------------------------ |
| `id`   | MAL ID or IGDB ID        |
| `type` | `anime`, `manga`, `game` |

**Response `200`:**

```json
{
  "externalId": "5114",
  "title": "Fullmetal Alchemist: Brotherhood",
  "coverUrl": "https://...",
  "score": 9.1,
  "genres": ["Action"],
  "synopsis": "...",
  "status": "Finished Airing",
  "mediaType": "anime",
  "episodes": 64,
  "chapters": null
}
```

Game response additionally includes `developers: [...]`. Anime includes `episodes`, manga includes `chapters`.

**Errors:**

- `400` — missing or invalid params
- `404` — not found on external API

---

### AI — `/ai`

All AI endpoints require authentication. Responses depend on Gemini 2.0 Flash + external API enrichment (cover images, scores from Jikan/IGDB).

#### POST `/ai/vibe-check`

Given a set of reference titles from the user's collection, get AI recommendations across chosen media types.

**Auth:** required

**Request body:**

```json
{
  "referenceIds": [3, 7, 12],
  "targetMediaTypes": ["anime", "game"],
  "excludeTitles": ["Berserk", "Dark Souls"]
}
```

`referenceIds` — collection item IDs (must belong to the authenticated user). `excludeTitles` is optional.

**Response `200`:**

```json
{
  "anime": [
    {
      "title": "Vinland Saga",
      "reason": "Shares Berserk's brutal medieval setting and protagonist driven by vengeance.",
      "externalId": "37521",
      "coverUrl": "https://...",
      "score": 8.7,
      "mediaType": "anime"
    }
  ],
  "game": [
    /* same shape */
  ]
}
```

Only keys in `targetMediaTypes` are present. Max 3 results per type.

**Errors:**

- `400` — `referenceIds` or `targetMediaTypes` missing or empty
- `404` — none of the provided IDs found in user's collection

---

#### POST `/ai/title-match`

Given one title from the user's collection, find similar titles across all three media types.

**Auth:** required

**Request body:**

```json
{
  "collectionId": 3,
  "excludeTitles": ["Vinland Saga"]
}
```

`excludeTitles` is optional.

**Response `200`:** Same shape as `/ai/vibe-check`, always includes `anime`, `manga`, and `game` keys.

**Errors:**

- `400` — `collectionId` missing
- `404` — collection item not found or doesn't belong to user

---

#### POST `/ai/taste-dna`

Generate (or regenerate) a 3-sentence taste profile for the authenticated user based on their entire collection.

**Auth:** required

**Request body:** none (empty `{}`)

**Response `200`:**

```json
{
  "content": "John gravitates toward dark, psychologically complex narratives with morally ambiguous protagonists. His collection reflects a preference for slow-burn stories that reward patience with thematic depth...",
  "generatedAt": "2026-04-24T10:00:00.000Z"
}
```

The profile is stored in the database and overwritten on every call. The result is also accessible via `GET /auth/profile`.

**Errors:**

- `400` — user's collection is empty
