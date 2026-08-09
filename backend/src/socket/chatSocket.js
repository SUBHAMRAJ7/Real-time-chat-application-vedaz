const Message = require("../models/Message");

const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
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
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = initializeSocket;