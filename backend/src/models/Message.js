const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Username of the person who sent the message.
    // Kept for compatibility with the existing global chat.
    username: {
      type: String,
      required: true,
      trim: true,
    },

    // Message content
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // User who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // User who should receive the message.
    // null means this is a global chat message.
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for quickly finding private conversations
messageSchema.index({
  sender: 1,
  receiver: 1,
  createdAt: 1,
});

const Message = mongoose.model(
  "Message",
  messageSchema
);

module.exports = Message;