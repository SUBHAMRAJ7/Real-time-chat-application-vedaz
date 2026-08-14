const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Not authorized. Please login.",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message:
          "Not authorized. Token missing.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user =
      await User.findById(decoded.userId).select(
        "-password"
      );

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists.",
      });
    }

    // Attach authenticated user to request
    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      message:
        "Not authorized. Invalid or expired token.",
    });
  }
};

module.exports = protect;