const protect = require("../middleware/authMiddleware");
const express = require("express");

const {
  sendMessage,
  getMessages,
  sendPrivateMessage,
  getPrivateMessages,
  getConversations,
} = require("../controllers/messageController");

const router = express.Router();

// ==================================================
// GLOBAL CHAT
// ==================================================

router.post("/",  protect, sendMessage);

router.get("/", protect, getMessages);

// ==================================================
// PRIVATE CHAT
// ==================================================

// Send private message
router.post(
  "/private",
  protect,
  sendPrivateMessage
);
router.get(
  "/conversations/:userId",
  protect,
  getConversations
);
// Get private conversation
router.get(
  "/private/:userId",
  protect,
  getPrivateMessages
);

module.exports = router;