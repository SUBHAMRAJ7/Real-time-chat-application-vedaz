const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Message = require("../models/Message");
const User = require("../models/User");

const onlineUsers = new Map();

// ==================================================
// SOCKET AUTHENTICATION
// ==================================================

const initializeSocket = (io) => {
  // Authenticate every Socket.IO connection
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            "Authentication required"
          )
        );
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      if (!decoded?.userId) {
        return next(
          new Error(
            "Invalid authentication token"
          )
        );
      }

      const user =
        await User.findById(
          decoded.userId
        );

      if (!user) {
        return next(
          new Error(
            "User no longer exists"
          )
        );
      }

      // Store authenticated user
      // directly on the socket
      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      };

      next();
    } catch (error) {
      console.error(
        "Socket authentication failed:",
        error.message
      );

      next(
        new Error(
          "Invalid or expired token"
        )
      );
    }
  });

  // ==================================================
  // CONNECTION
  // ==================================================

  io.on("connection", (socket) => {
    console.log(
      "Authenticated user connected:",
      socket.user.name,
      socket.id
    );

    // ==================================================
    // REGISTER AUTHENTICATED USER
    // ==================================================

    socket.on(
      "join_chat",
      async () => {
        try {
          /*
           * IMPORTANT:
           *
           * We no longer trust userId/username
           * coming from the frontend.
           *
           * They come from the verified JWT.
           */

          const userId =
            socket.user.id;

          const username =
            socket.user.name;

          // Store authenticated user
          onlineUsers.set(
            socket.id,
            {
              userId,
              username,
            }
          );

          console.log(
            `${username} joined with socket ${socket.id}`
          );

          // Mark user online
          await User.findByIdAndUpdate(
            userId,
            {
              isOnline: true,
            }
          );

          // Send online users
          io.emit(
            "online_users",
            Array.from(
              onlineUsers.values()
            ).map(
              (user) =>
                user.username
            )
          );
        } catch (error) {
          console.error(
            "Join chat error:",
            error
          );
        }
      }
    );

    // ==================================================
    // TYPING
    // ==================================================

    socket.on(
      "typing",
      (data) => {
        if (!data) {
          return;
        }

        socket.broadcast.emit(
          "user_typing",
          {
            username:
              socket.user.name,
            isTyping:
              data.isTyping,
          }
        );
      }
    );

    // ==================================================
    // GLOBAL MESSAGE
    // ==================================================

    socket.on(
      "send_message",
      async (data) => {
        try {
          const text =
            data?.text;

          if (
            !text ||
            !text.trim()
          ) {
            socket.emit(
              "message_error",
              {
                message:
                  "Message is required",
              }
            );

            return;
          }

          const newMessage =
            await Message.create({
              username:
                socket.user.name,
              text: text.trim(),
              sender: null,
              receiver: null,
            });

          io.emit(
            "new_message",
            newMessage
          );
        } catch (error) {
          console.error(
            "Global socket message error:",
            error
          );

          socket.emit(
            "message_error",
            {
              message:
                "Failed to send message",
            }
          );
        }
      }
    );

    // ==================================================
    // PRIVATE CHAT ROOM
    // ==================================================

    socket.on(
      "join_private_chat",
      ({
        currentUserId,
        otherUserId,
      }) => {
        try {
          /*
           * The current user MUST be the
           * authenticated socket user.
           */

          if (
            currentUserId !==
            socket.user.id
          ) {
            console.warn(
              "Unauthorized private room attempt"
            );

            return;
          }

          if (
            !otherUserId
          ) {
            return;
          }

          if (
            !mongoose.Types.ObjectId.isValid(
              currentUserId
            ) ||
            !mongoose.Types.ObjectId.isValid(
              otherUserId
            )
          ) {
            return;
          }

          const roomId = [
            currentUserId.toString(),
            otherUserId.toString(),
          ]
            .sort()
            .join("_");

          socket.join(roomId);

          console.log(
            `Socket ${socket.id} joined private room ${roomId}`
          );

          socket.emit(
            "private_chat_joined",
            {
              roomId,
            }
          );
        } catch (error) {
          console.error(
            "Join private chat error:",
            error
          );
        }
      }
    );

    // ==================================================
    // PRIVATE MESSAGE
    // ==================================================

    socket.on(
      "send_private_message",
      async (data) => {
        try {
          const {
            receiverId,
            text,
          } = data;

          /*
           * senderId is NOT accepted from
           * the frontend anymore.
           *
           * The sender is taken from
           * the authenticated JWT.
           */

          const senderId =
            socket.user.id;

          if (
            !receiverId ||
            !text ||
            !text.trim()
          ) {
            socket.emit(
              "private_message_error",
              {
                message:
                  "Receiver and message are required",
              }
            );

            return;
          }

          if (
            !mongoose.Types.ObjectId.isValid(
              senderId
            ) ||
            !mongoose.Types.ObjectId.isValid(
              receiverId
            )
          ) {
            socket.emit(
              "private_message_error",
              {
                message:
                  "Invalid user ID",
              }
            );

            return;
          }

          if (
            senderId ===
            receiverId
          ) {
            socket.emit(
              "private_message_error",
              {
                message:
                  "You cannot message yourself",
              }
            );

            return;
          }

          const sender =
            await User.findById(
              senderId
            );

          const receiver =
            await User.findById(
              receiverId
            );

          if (
            !sender ||
            !receiver
          ) {
            socket.emit(
              "private_message_error",
              {
                message:
                  "User not found",
              }
            );

            return;
          }

          const newMessage =
            await Message.create({
              username:
                sender.name,
              text: text.trim(),
              sender:
                sender._id,
              receiver:
                receiver._id,
            });

          const roomId = [
            senderId.toString(),
            receiverId.toString(),
          ]
            .sort()
            .join("_");

          io.to(roomId).emit(
            "new_private_message",
            newMessage
          );
        } catch (error) {
          console.error(
            "Private socket message error:",
            error
          );

          socket.emit(
            "private_message_error",
            {
              message:
                "Failed to send private message",
            }
          );
        }
      }
    );

    // ==================================================
    // DISCONNECT
    // ==================================================

    socket.on(
      "disconnect",
      async () => {
        const user =
          onlineUsers.get(
            socket.id
          );

        onlineUsers.delete(
          socket.id
        );

        console.log(
          user
            ? `${user.username} disconnected`
            : `User disconnected: ${socket.id}`
        );

        // Mark THIS specific user offline
        if (
          user?.userId &&
          mongoose.Types.ObjectId.isValid(
            user.userId
          )
        ) {
          try {
            /*
             * Only mark offline if this was
             * the user's last connection.
             */

            const stillConnected =
              Array.from(
                onlineUsers.values()
              ).some(
                (onlineUser) =>
                  onlineUser.userId?.toString() ===
                  user.userId.toString()
              );

            if (
              !stillConnected
            ) {
              await User.findByIdAndUpdate(
                user.userId,
                {
                  isOnline: false,
                }
              );
            }
          } catch (error) {
            console.error(
              "Update offline status error:",
              error
            );
          }
        }

        // Update everyone
        io.emit(
          "online_users",
          Array.from(
            onlineUsers.values()
          ).map(
            (onlineUser) =>
              onlineUser.username
          )
        );
      }
    );
  });
};

module.exports =
  initializeSocket;