# Party Game

A real-time party game application (like 'Imposter') built with Next.js and NestJS.

## Tech Stack
- **Frontend**: Next.js 16 (React 19), Tailwind CSS 4, Radix UI.
- **Backend**: NestJS, TypeORM, PostgreSQL, Passport (Google Auth), Socket.io (planned).

## Getting Started

### Prerequisites
- Node.js (v20+)
- Docker (for Database)

### 1. Start the Infrastructure
Start PostgreSQL using Docker Compose:
```bash
docker-compose up -d
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment:
   ```bash
   cp .env.example .env
   # Edit .env with your Google Client credentials
   ```
4. Start the server (runs on port 4000):
   ```bash
   npm run start:dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application (runs on port 3000):
   ```bash
   npm run dev
   ```

## Features
- **Google Authentication**: Secure sign-in to the backend with JWT cookies.
- **Lobby System**: (Coming Soon)
- **Game Logic**: (Coming Soon)