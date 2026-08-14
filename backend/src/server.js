const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const initializeSocket = require("./socket/chatSocket");

dotenv.config();

// ==================================================
// APP SETUP
// ==================================================

const app = express();

const server = http.createServer(app);

// ==================================================
// PORT
// ==================================================

const PORT = process.env.PORT || 5000;

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

// ==================================================
// ROUTES
// ==================================================

app.use(
  "/api/messages",
  messageRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

// ==================================================
// SOCKET.IO
// ==================================================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: [
      "GET",
      "POST",
    ],
  },
});

// ==================================================
// TEST ROUTE
// ==================================================

app.get("/", (req, res) => {
  res.json({
    message:
      "Chat server is running",
  });
});

// ==================================================
// SOCKET INITIALIZATION
// ==================================================

initializeSocket(io);

// ==================================================
// MONGODB + SERVER START
// ==================================================

const startServer =
  async () => {
    try {
      await mongoose.connect(
        process.env.MONGO_URI
      );

      console.log(
        "MongoDB connected"
      );

      // ==================================================
      // RESET STALE ONLINE STATUS
      // ==================================================

      const User =
        require("./models/User");

      await User.updateMany(
        {},
        {
          $set: {
            isOnline: false,
          },
        }
      );

      console.log(
        "All users marked offline"
      );

      // ==================================================
      // START SERVER
      // ==================================================

      server.listen(
        PORT,
        "0.0.0.0",
        () => {
          console.log(
            `Server running on port ${PORT}`
          );
        }
      );
    } catch (error) {
      console.error(
        "Server startup failed:",
        error
      );

      process.exit(1);
    }
  };

startServer();