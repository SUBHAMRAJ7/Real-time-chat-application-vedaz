# Real-Time Chat Application

A real-time chat application built using **React Native (Expo)** for the frontend and **Node.js, Express, Socket.io, and MongoDB** for the backend.

The application allows multiple users to join a chat using a username, exchange messages in real time, view previous messages, and see typing and online/offline status.

---

## Features

### Core Features

- Real-time messaging using Socket.io
- Send and receive messages instantly
- Multiple connected users
- Persistent chat history using MongoDB
- Message timestamps
- Fetch previous messages after refreshing
- REST API for sending messages
- REST API for fetching chat history
- Connection and disconnection handling
- Clean and responsive chat interface

### Bonus Features

- Username-based dummy login
- Typing indicator
- Online/offline connection status
- MongoDB message persistence

---

## Tech Stack

### Frontend

- React Native
- Expo
- TypeScript
- Socket.io Client

### Backend

- Node.js
- Express.js
- Socket.io
- MongoDB
- Mongoose
- dotenv

### Development Tools

- Git
- GitHub
- Visual Studio Code
- Expo

---

## Project Architecture

```text
Real-time-chat-application-vedaz/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── messagecontroller.js
│   │   │
│   │   ├── models/
│   │   │   └── Message.js
│   │   │
│   │   ├── routes/
│   │   │   └── messageRoutes.js
│   │   │
│   │   ├── socket/
│   │   │   └── chatSocket.js
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       └── explore.tsx
│   │
│   ├── assets/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md