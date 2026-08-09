# Real-Time Chat Application

A real-time chat application built using **React Native (Expo)** for the frontend and **Node.js, Express.js, Socket.io, and MongoDB** for the backend.

The application allows multiple users to join a common chat using a username, exchange messages in real time, view previous messages after refreshing the application, see message timestamps, view online/offline connection status, and see when another user is typing.

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
- Socket.io real-time communication
- Connection and disconnection handling
- Clean and responsive chat interface
- Error handling for API and Socket.io operations

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
- MongoDB Compass

---

## Project Architecture

```text
Real-time-chat-application-vedaz/
│
├── backend/
│   │
│   ├── src/
│   │   │
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
│   │
│   ├── src/
│   │   └── app/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       └── explore.tsx
│   │
│   ├── assets/
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
Prerequisites

Before running the application, make sure the following are installed:

Node.js
npm
Git
MongoDB or MongoDB Atlas
MongoDB Compass (optional)
Expo
Expo Go (for Android device testing)
Visual Studio Code

Check Node.js and npm:

node --version
npm --version
Installation and Setup
1. Clone the Repository

Clone the GitHub repository:

git clone https://github.com/SUBHAMRAJ7/Real-time-chat-application-vedaz.git

Navigate into the project:

cd Real-time-chat-application-vedaz
Backend Setup

Open a terminal and navigate to the backend:

cd backend

Install backend dependencies:

npm install
Environment Variables

Create a .env file inside the backend directory.

The structure should be:

backend/
├── src/
├── package.json
├── package-lock.json
└── .env

Add the following environment variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string

Example:

PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp

For MongoDB Atlas, use your Atlas connection string:

PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp

Never commit the .env file to GitHub.

The .env file is excluded using .gitignore.

Run the Backend

From the backend directory:

npm run dev

The server should start on:

http://localhost:5000

Expected output:

Server running on http://localhost:5000
MongoDB connected
Frontend Setup

Open a second terminal.

Navigate to the frontend:

cd frontend

Install frontend dependencies:

npm install

Start Expo:

npx expo start

Expo will display a QR code and development options.

Run on Web

After Expo starts, press:

W

The application will open in the browser.

Default development URL:

http://localhost:8081
Run on Android

Install Expo Go on an Android device.

Make sure:

The backend server is running.
Expo is running.
The computer and Android device are connected to the same Wi-Fi network.
Scan the QR code displayed by Expo.
Important

When running the application on a physical Android device, localhost refers to the Android device itself.

Therefore, use the computer's local network IP address for the backend instead of:

http://localhost:5000

For example:

http://192.168.1.10:5000

The exact IP address depends on the local network.

API Documentation

The backend provides REST APIs for persistent message operations.

Get Chat History
Endpoint
GET /api/messages
Full URL
http://localhost:5000/api/messages
Purpose

Fetches previously stored messages from MongoDB.

Example Response
[
  {
    "_id": "message_id",
    "username": "Subham",
    "text": "Hello!",
    "createdAt": "2026-08-10T10:30:00.000Z"
  }
]

The frontend uses this endpoint to restore previous chat messages after refreshing the application.

Send Message
Endpoint
POST /api/messages
Full URL
http://localhost:5000/api/messages
Request Body
{
  "username": "Subham",
  "text": "Hello Rahul!"
}
Purpose

Creates and stores a new message in MongoDB.

The stored message can then be delivered to connected users through Socket.io.

Socket.io Real-Time Communication

Socket.io is used for the mandatory real-time communication functionality.

The application uses Socket.io to:

Send messages instantly
Broadcast messages to connected users
Display typing status
Handle user connections
Handle user disconnections
Report real-time errors
Client → Server Events
send_message

Used when a user sends a message through the Socket.io connection.

Example:

socket.emit("send_message", {
  username: "Subham",
  text: "Hello Rahul!"
});
typing

Used to notify other users that the current user is typing.

Example:

socket.emit("typing", {
  username: "Subham",
  isTyping: true
});

When the user stops typing:

socket.emit("typing", {
  username: "Subham",
  isTyping: false
});
Server → Client Events
new_message

Used to deliver a newly created message to connected clients.

Example:

socket.on("new_message", (message) => {
  // Update chat interface
});
user_typing

Used to display the typing indicator.

Example:

socket.on("user_typing", (data) => {
  // Display typing status
});
message_error

Used to handle errors related to real-time message processing.

Example:

socket.on("message_error", (error) => {
  // Handle error
});
Real-Time Messaging Flow

When a user sends a message, the following process occurs:

User A
   │
   │ send_message
   ▼
Socket.io Server
   │
   ├──────────────► Save Message
   │                     │
   │                     ▼
   │                  MongoDB
   │
   └──────────────► Broadcast new_message
                         │
                         ├────────► User A
                         │
                         └────────► User B

This allows connected users to receive messages instantly without refreshing the application.

Message History Flow

When the application starts or refreshes:

React Native / Expo
        │
        │ GET /api/messages
        ▼
Express REST API
        │
        ▼
MongoDB
        │
        │ Previous messages
        ▼
React Native / Expo
        │
        ▼
Display Chat History

This provides persistent chat history.

Username-Based Login

The application includes a username-based dummy login as a bonus feature.

Users enter a username before joining the chat.

Example:

User 1:
Subham

User 2:
Rahul

The username is displayed in the chat interface so users can identify the sender.

Authentication Note

This is dummy authentication.

The application does not currently implement:

Password authentication
JWT authentication
User registration
Secure account management
Email verification

The username is primarily used to identify users during the chat session.

Typing Indicator

The application includes a real-time typing indicator using Socket.io.

When a user starts typing, other connected users can see:

Rahul is typing...

The indicator disappears when the user stops typing.

This feature uses Socket.io events rather than polling.

Online / Offline Status

The application displays the current Socket.io connection status.

When connected:

🟢 Online

When disconnected:

Offline

The frontend listens for Socket.io connection and disconnection events.

Example:

socket.on("connect", () => {
  // User connected
});

socket.on("disconnect", () => {
  // User disconnected
});
MongoDB Persistence

MongoDB is used to persist chat messages.

Messages contain information such as:

_id
username
text
createdAt

MongoDB persistence ensures that previously sent messages remain available after refreshing the application.

Design Decisions
React Native + Expo

React Native was selected because the assignment prefers React Native for the frontend.

Expo was used to simplify development and allow the application to be tested during development on web and Android.

Node.js + Express

Node.js provides the backend runtime.

Express.js is used to implement the REST API layer for message-related operations.

Socket.io

Socket.io was selected because real-time communication is a mandatory requirement of the assignment.

Socket.io provides:

Bidirectional communication
Event-based communication
Real-time broadcasting
Connection management
Disconnection events
MongoDB

MongoDB was selected to persist chat messages.

This allows users to retrieve previous messages after refreshing the application.

REST API + Socket.io

The application uses both REST APIs and Socket.io because they serve different purposes.

REST APIs

Used for:

Sending/storing messages
Fetching previous messages
Socket.io

Used for:

Real-time message delivery
Broadcasting messages
Typing indicator
Connection status
Error Handling

The application handles common errors including:

Invalid message data
Failed MongoDB operations
Failed REST API requests
Socket connection failures
Socket disconnections
Real-time message errors
Attempts to send messages while disconnected

The frontend also disables message sending when the Socket.io connection is unavailable.

Testing

The application was tested using multiple browser sessions to verify real-time communication.

Test Users
User 1
Username: Subham
User 2
Username: Rahul
Real-Time Messaging Test

User 1 sends:

Hello Rahul!

User 2 receives the message immediately without refreshing the application.

User 2 sends:

Hi Subham!

User 1 receives the message immediately.

Tested Functionality
 Username login
 Send messages
 Receive messages
 Real-time Socket.io communication
 Multiple connected users
 Message timestamps
 Message persistence
 Chat history after refresh
 Socket connection handling
 Socket disconnection handling
 Online/offline status
 Typing indicator
 MongoDB persistence
 REST API message operations
Screenshots

Screenshots can be added to demonstrate the application.

Recommended screenshots:

Username login screen
Main chat screen
Two users exchanging messages
Typing indicator
Online/offline status

If screenshots are added to the repository, they can be referenced like this:

![Login Screen](screenshots/login.png)

![Chat Screen](screenshots/chat.png)

![Real-Time Messaging](screenshots/realtime.png)

![Typing Indicator](screenshots/typing.png)
Assumptions
The application uses dummy username authentication.
All users currently participate in the same chat.
No password-based authentication is implemented.
MongoDB must be available through the configured connection string.
The backend runs on port 5000 by default.
Expo is used for frontend development.
localhost is used when frontend and backend run on the same computer.
A local network IP address is required when testing on a physical Android device.
The application is intended as a technical assignment/demo project rather than a production messaging platform.
Current Limitations

The following features are not currently implemented:

Secure user authentication
Private one-to-one conversations
Multiple chat rooms
Read/delivered message status
File sharing
Image sharing
Push notifications
Message editing
Message deletion
Production backend deployment
Production database configuration
Future Improvements

Possible future improvements include:

JWT-based authentication
User registration and login
Private one-to-one conversations
Multiple chat rooms
Read and delivered message status
Image and file sharing
Push notifications
User profile pictures
Message editing and deletion
Message search
Production deployment
HTTPS/WSS
Redis adapter for Socket.io scaling
Rate limiting
Input sanitization
Automated unit and integration tests
Requirement Coverage
Assignment Requirement	Status
React Native frontend	✅ Completed
Clean chat interface	✅ Completed
Send messages	✅ Completed
Receive messages instantly	✅ Completed
Previous messages after refresh	✅ Completed
Message timestamps	✅ Completed
Node.js backend	✅ Completed
Express.js	✅ Completed
Send message REST API	✅ Completed
Fetch chat history REST API	✅ Completed
Socket.io implementation	✅ Completed
Real-time message delivery	✅ Completed
Broadcast messages	✅ Completed
Connection handling	✅ Completed
Disconnection handling	✅ Completed
Organized project structure	✅ Completed
API error handling	✅ Completed
Socket error handling	✅ Completed
MongoDB persistence	✅ Completed
Username-based login	✅ Bonus
Typing indicator	✅ Bonus
Online/offline status	✅ Bonus
Read/delivered status	⏳ Optional
Backend deployment	⏳ Optional
Running the Complete Application

The backend and frontend should run in separate terminals.

Terminal 1 — Backend
cd backend
npm install
npm run dev

Expected:

Server running on http://localhost:5000
MongoDB connected
Terminal 2 — Frontend
cd frontend
npm install
npx expo start

For web, press:

W

For Android, scan the Expo QR code using Expo Go.

Security

Sensitive configuration values are stored in the backend .env file.

The following files and directories should not be committed to GitHub:

.env
node_modules/
.expo/

The MongoDB connection string should always be stored as an environment variable instead of being hard-coded into the source code.

Git and GitHub

The project uses Git for version control.

The repository contains:

Backend source code
Frontend source code
Package configuration
Project documentation
.gitignore

The repository is hosted on GitHub under:

SUBHAMRAJ7/Real-time-chat-application-vedaz
Submission
GitHub Repository

Repository:

SUBHAMRAJ7/Real-time-chat-application-vedaz
APK

The Android APK will be provided separately after generating the production build.

Screen Recording

If an APK cannot be generated, a screen recording demonstrating the following will be provided:

Username login
Sending a message
Receiving a message in real time
Message timestamps
Typing indicator
Online/offline status
Chat history after refresh
Google Drive

The APK or screen recording will be uploaded to Google Drive and the shareable link will be added here before final submission.

Project Status
Frontend:       ✅ Completed
Backend:        ✅ Completed
MongoDB:        ✅ Connected
REST APIs:      ✅ Working
Socket.io:      ✅ Working
Real-Time Chat: ✅ Working
Typing Status:  ✅ Working
Online Status:  ✅ Working
README:         ✅ Completed
GitHub:         ✅ Repository created
APK:            ⏳ To be generated
Author

Subham Raj

GitHub:

SUBHAMRAJ7
License

This project was developed as a technical assignment and demonstration project.
