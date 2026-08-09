const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const messageRoutes = require("./routes/messageRoutes");
const initializeSocket = require("./socket/chatSocket");
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api/messages", messageRoutes);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Chat server is running",
  });
});

// Socket.io
initializeSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});