const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    console.log("GET /api/users called");

    const users = await User.find({})
      .select("_id name email profileImage isOnline")
      .sort({ name: 1 });

    console.log("Users found:", users.length);

    res.json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isOnline: user.isOnline,
      })),
    });
  } catch (error) {
    console.error("GET USERS ERROR:");
    console.error(error);

    res.status(500).json({
      message: error.message || "Failed to fetch users",
    });
  }
};

module.exports = {
  getUsers,
};