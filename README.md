# Party Game Project

A real-time multiplayer party game application built with modern web technologies.

## 🚀 Features

- **Real-Time Lobby System**: Create and join rooms instantly using Socket.io.
- **Imposter Game Mode**: A social deduction game where players must find the imposter among them.
- **Profile Management**: Custom usernames and persistent profiles.
- **Responsive UI**: Built with Tailwind CSS for mobile and desktop support.
- **Secure Authentication**: Google OAuth integration with JWT sessions.

## 🛠️ Tech Stack

- **Backend**: [NestJS](https://nestjs.com/) (Node.js framework), TypeORM, PostgreSQL.
- **Frontend**: [Next.js 16](https://nextjs.org/), Tailwind CSS 4.
- **Real-Time**: [Socket.io](https://socket.io/) for bidirectional communication.
- **Database**: PostgreSQL (managed via Docker).

## 📦 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) (for running the database)

## 🏁 Getting Started

### 1. clone the repository
```bash
git clone https://github.com/gyedongjeon/partygame.git
cd partygame
```

### 2. Setup Environment Variables
Create a `.env` file in the `backend` directory (copy from `.env.example` if available) and configure your credentials:
```env
# Backend .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=partygame
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start Database
```bash
# In the root directory (assuming docker-compose.yml exists)
docker-compose up -d db
```

### 4. Run Backend
```bash
cd backend
npm install
npm run start:dev
```
Backend will start at `http://localhost:4000`.

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will start at `http://localhost:3000`.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'feat: Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.