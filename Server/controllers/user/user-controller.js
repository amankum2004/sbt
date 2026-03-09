const prisma = require("../../utils/prisma");

const fetchUsers = async (req, res) => {
  try {
    let where = {};

    if (req.query.role) {
      where = { usertype: req.query.role };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        usertype: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ users: users.map((user) => ({ _id: user.id, ...user })) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const updateUserType = async (req, res) => {
  try {
    const { email, userType } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { usertype: userType },
    });

    res.status(200).json({
      message: "User type updated successfully",
      user: { _id: updatedUser.id, ...updatedUser },
    });
  } catch (error) {
    console.error("Error updating user type:", error);
    res.status(500).json({ error: "Error updating user type" });
  }
};

const userType = async (req, res) => {
  try {
    const { email } = req.user;
    const normalizedEmail = (email || "").trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      userType: user.usertype,
      userName: user.name,
      userPhone: user.phone,
    });
  } catch (error) {
    console.error("Error fetching user type:", error);
    res.status(500).json({ error: "Error fetching user type" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, phone },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated",
      user: { _id: updatedUser.id, ...updatedUser },
    });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { fetchUsers, updateUserType, userType, updateProfile };
