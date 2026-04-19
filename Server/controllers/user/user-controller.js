const prisma = require("../../utils/prisma");

const fetchUsers = async (req, res) => {
  try {
    let where = { isDeleted: false };

    if (req.query.role) {
      where.usertype = req.query.role;
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
      where: { email: normalizedEmail, isDeleted: false },
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
      where: { email: normalizedEmail, isDeleted: false },
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

    const existingUser = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email, phone },
    });

    res.json({
      message: "Profile updated",
      user: { _id: updatedUser.id, ...updatedUser },
    });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isDeleted: true, email: true, phone: true },
    });

    if (!existingUser || existingUser.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    const deletionStamp = Date.now();
    const scrubbedEmail = `deleted+${existingUser.id}+${deletionStamp}@salonhub.invalid`;
    const scrubbedPhone = `deleted-${existingUser.id}`;

    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        email: scrubbedEmail,
        phone: scrubbedPhone,
      },
    });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion failed:", error);
    return res.status(500).json({ message: "Failed to delete account" });
  }
};

module.exports = { fetchUsers, updateUserType, userType, updateProfile, deleteAccount };
