const Message = require("../models/Message");

const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register user
    socket.on("join_chat", (username) => {
      if (!username) return;

      onlineUsers.set(socket.id, username);

      console.log(`${username} joined with socket ${socket.id}`);

      // Send current online users to everyone
      io.emit(
  "online_users",
  Array.from(onlineUsers.values())
);
    });

    // User starts/stops typing
    socket.on("typing", (data) => {
      socket.broadcast.emit("user_typing", {
        username: data.username,
        isTyping: data.isTyping,
      });
    });

    // Receive a new message
    socket.on("send_message", async (data) => {
      try {
        const { username, text } = data;

        if (!username || !text) {
          socket.emit("message_error", {
            message: "Username and message are required",
          });
          return;
        }

        // Save message to MongoDB
        const newMessage = await Message.create({
          username,
          text,
        });

        // Send message to all connected users
        io.emit("new_message", newMessage);
      } catch (error) {
        console.error("Socket message error:", error);

        socket.emit("message_error", {
          message: "Failed to send message",
        });
      }
    });

    // User disconnected
    socket.on("disconnect", () => {
      const username = onlineUsers.get(socket.id);

      onlineUsers.delete(socket.id);

      console.log(
        username
          ? `${username} disconnected`
          : `User disconnected: ${socket.id}`
      );

      // Update everyone
      io.emit(
        "online_users",
        Array.from(onlineUsers.values())
      );
      
    });
  });
};

module.exports = initializeSocket;