const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

// ==================================================
// SEND GLOBAL MESSAGE
// ==================================================

const sendMessage = async (req, res) => {
  try {
    const { username, text } = req.body;

    if (!username || !text) {
      return res.status(400).json({
        message: "Username and message are required",
      });
    }

    const message = await Message.create({
      username,
      text,
      sender: null,
      receiver: null,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
};

// ==================================================
// GET GLOBAL CHAT HISTORY
// ==================================================

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      sender: null,
      receiver: null,
    })
      .sort({ createdAt: 1 })
      .limit(100);

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};

// ==================================================
// SEND PRIVATE MESSAGE
// ==================================================

const sendPrivateMessage = async (req, res) => {
  try {
    const {
      senderId,
      receiverId,
      text,
    } = req.body;

    if (
      !senderId ||
      !receiverId ||
      !text
    ) {
      return res.status(400).json({
        message:
          "Sender, receiver and message are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        senderId
      ) ||
      !mongoose.Types.ObjectId.isValid(
        receiverId
      )
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        message:
          "You cannot send a private message to yourself",
      });
    }

    // Check sender
    const sender = await User.findById(
      senderId
    );

    if (!sender) {
      return res.status(404).json({
        message: "Sender not found",
      });
    }

    // Check receiver
    const receiver = await User.findById(
      receiverId
    );

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    const message =
      await Message.create({
        username: sender.name,
        text: text.trim(),
        sender: sender._id,
        receiver: receiver._id,
      });

    res.status(201).json(message);
  } catch (error) {
    console.error(
      "Send private message error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to send private message",
    });
  }
};

// ==================================================
// GET PRIVATE CHAT HISTORY
// ==================================================

const getPrivateMessages = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;
    const { currentUserId } = req.query;

    if (
      !userId ||
      !currentUserId
    ) {
      return res.status(400).json({
        message:
          "User ID and current user ID are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      ) ||
      !mongoose.Types.ObjectId.isValid(
        currentUserId
      )
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const messages =
      await Message.find({
        $or: [
          {
            sender: currentUserId,
            receiver: userId,
          },
          {
            sender: userId,
            receiver: currentUserId,
          },
        ],
      })
        .sort({ createdAt: 1 })
        .limit(100);

    res.status(200).json(messages);
  } catch (error) {
    console.error(
      "Get private messages error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch private messages",
    });
  }
};
// ==================================================
// GET CONVERSATIONS
// ==================================================

const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    if (
      !userId ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const conversations =
      await Message.aggregate([
        {
          $match: {
            $or: [
              {
                sender: new mongoose.Types.ObjectId(
                  userId
                ),
              },
              {
                receiver:
                  new mongoose.Types.ObjectId(
                    userId
                  ),
              },
            ],
          },
        },

        {
          $sort: {
            createdAt: -1,
          },
        },

        {
          $group: {
            _id: {
              $cond: [
                {
                  $eq: [
                    "$sender",
                    new mongoose.Types.ObjectId(
                      userId
                    ),
                  ],
                },
                "$receiver",
                "$sender",
              ],
            },

            lastMessage: {
              $first: "$text",
            },

            lastMessageTime: {
              $first: "$createdAt",
            },

            sender: {
              $first: "$sender",
            },

            receiver: {
              $first: "$receiver",
            },
          },
        },

        {
          $sort: {
            lastMessageTime: -1,
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },

        {
          $unwind: "$user",
        },

        {
          $project: {
            _id: 0,

            userId: "$user._id",

            name: "$user.name",

            email: "$user.email",

            profileImage:
              "$user.profileImage",

            isOnline:
              "$user.isOnline",

            lastMessage: 1,

            lastMessageTime: 1,
          },
        },
      ]);

    res.status(200).json(
      conversations
    );
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch conversations",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  sendPrivateMessage,
  getPrivateMessages,
  getConversations,
};