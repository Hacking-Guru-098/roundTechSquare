# Full Stack Task Tracker 

Monorepo with:
- **Backend**: Node.js + Express + TypeScript + MongoDB (JWT auth)
- **Frontend**: Expo (React Native) + TypeScript + React Navigation + TanStack Query

## Prerequisites
- Node.js (LTS recommended)
- MongoDB running locally (or a MongoDB URI)
- Expo Go app (optional, for quick testing on device)

## Setup

### 1) Backend env
Create `backend/.env` from `backend/.env.example`:
- `MONGODB_URI`: your MongoDB connection string
- `JWT_SECRET`: long random secret

### 2) Frontend env
Create `frontend/.env` from `frontend/.env.example`:
- `EXPO_PUBLIC_API_BASE_URL`: backend base URL
  - Android emulator: `http://10.0.2.2:5000`
  - iOS simulator: `http://localhost:5000`
  - Physical device: use your machine LAN IP, e.g. `http://192.168.1.50:5000`

## Run (Dev)

### Backend
```bash
cd backend
npm install
npm run dev
```

Backend health check:
- `GET /health` → `{ "status": "ok" }`

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Documentation

### Response format
Success:
```json
{ "success": true, "data": { /* ... */ } }
```

Error:
```json
{ "success": false, "message": "Validation error", "errors": { "field": "message" } }
```

### Auth

#### `POST /auth/signup`
Body:
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```
Returns: `{ token, user }`

#### `POST /auth/login`
Body:
```json
{ "email": "jane@example.com", "password": "secret123" }
```
Returns: `{ token, user }`

### Tasks (requires JWT)
Send header: `Authorization: Bearer <token>`

#### `GET /tasks`
Returns: `{ tasks: Task[] }`

#### `POST /tasks`
Body:
```json
{ "title": "Buy milk", "description": "2L" }
```
Returns: `{ task }`

#### `PATCH /tasks/:id`
Body (any subset):
```json
{ "title": "Buy oat milk", "description": "Unsweetened", "completed": true }
```
Returns: `{ task }`

#### `DELETE /tasks/:id`
Returns: `204 No Content`

## Frontend Notes
- Auth is persisted with AsyncStorage; Axios attaches `Authorization` automatically.
- Tasks use TanStack Query with invalidation + optimistic updates.
- Includes filters (All/Active/Completed) and an edit modal.
