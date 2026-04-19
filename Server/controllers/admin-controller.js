const prisma = require("../utils/prisma");
const { mapUser, mapContact, mapShop } = require("../utils/legacy-mappers");

const normalizeEmail = (value) => (value || "").trim().toLowerCase();

// LOGIC TO GET ALL USERS IN ADMIN
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        usertype: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json(users.map(mapUser));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// LOGIC TO GET SINGLE USER DATA USING ADMIN USERS
const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.user.findFirst({
      where: { id, isDeleted: false },
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
    return res.status(200).json(data ? mapUser(data) : null);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch user" });
  }
};

// USER UPDATE LOGIC
const updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedUserData = req.body || {};
    const updatedData = await prisma.user.update({
      where: { id },
      data: updatedUserData,
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
    return res.status(200).json(mapUser(updatedData));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update user" });
  }
};

// LOGIC TO DELETE USER FROM ADMIN USERS
const deleteUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, phone: true, isDeleted: true },
    });

    if (!existingUser || existingUser.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    const deletionStamp = Date.now();
    const scrubbedEmail = `deleted+${existingUser.id}+${deletionStamp}@salonhub.invalid`;
    const scrubbedPhone = `deleted-${existingUser.id}`;

    await prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        email: scrubbedEmail,
        phone: scrubbedPhone,
      },
    });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

// LOGIC TO GET ALL CONTACTS IN ADMIN
const getAllContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (!contacts || contacts.length === 0) {
      return res.status(404).json({ message: "No Contacts found" });
    }

    const contactEmails = contacts
      .map((contact) => normalizeEmail(contact.email))
      .filter(Boolean);

    const users = await prisma.user.findMany({
      where: { email: { in: contactEmails }, isDeleted: false },
      select: { email: true, usertype: true },
    });

    const userTypeByEmail = new Map(
      users.map((user) => [normalizeEmail(user.email), user.usertype || "customer"])
    );

    const contactsWithUserType = contacts.map((contact) => {
      const normalizedEmail = normalizeEmail(contact.email);
      return {
        ...mapContact(contact),
        usertype: userTypeByEmail.get(normalizedEmail) || "guest",
      };
    });

    return res.status(200).json(contactsWithUserType);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

// LOGIC TO DELETE CONTACT USING ADMIN
const deleteContactById = async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.contact.delete({ where: { id } });
    return res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to delete contact" });
  }
};

// LOGIC TO GET ALL SHOPS IN ADMIN
const getAllShops = async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({
      where: { isApproved: true },
      include: { services: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(Array.isArray(shops) ? shops.map(mapShop) : []);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch shops", error: error.message });
  }
};

// LOGIC TO GET SINGLE SHOP DATA USING ADMIN USERS
const getShopById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await prisma.shop.findUnique({
      where: { id },
      include: { services: true },
    });
    return res.status(200).json(data ? mapShop(data) : null);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to fetch shop" });
  }
};

const buildShopServicePayload = (services) => {
  if (!Array.isArray(services)) return [];
  return services
    .map((service) => {
      const serviceName = (service?.service || "").trim();
      const price = service?.price !== undefined ? String(service.price).trim() : "";
      if (!serviceName) return null;
      return {
        service: serviceName,
        price,
      };
    })
    .filter(Boolean);
};

// SHOP UPDATE LOGIC
const updateShopById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedShopData = req.body || {};
    const { services, ...rest } = updatedShopData;

    const updatedShop = await prisma.$transaction(async (tx) => {
      if (Array.isArray(services)) {
        await tx.shopService.deleteMany({ where: { shopId: id } });
      }

      return tx.shop.update({
        where: { id },
        data: {
          ...rest,
          ...(Array.isArray(services)
            ? {
                services: {
                  create: buildShopServicePayload(services),
                },
              }
            : {}),
        },
        include: { services: true },
      });
    });

    return res.status(200).json(mapShop(updatedShop));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update shop" });
  }
};

// LOGIC TO DELETE SHOP FROM ADMIN USERS
const deleteShopById = async (req, res) => {
  try {
    const id = req.params.id;
    await prisma.shop.delete({ where: { id } });
    return res.status(200).json({ message: "Shop deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to delete shop" });
  }
};

// Admin: get all pending (unapproved) shops
const getPendingShops = async (req, res) => {
  try {
    const pendingShops = await prisma.shop.findMany({
      where: { isApproved: false },
      include: { services: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(Array.isArray(pendingShops) ? pendingShops.map(mapShop) : []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending shops", error: err.message });
  }
};

// Admin: approve a shop
const approveShop = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await prisma.shop.update({
      where: { id },
      data: { isApproved: true },
      include: { services: true },
    });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ message: "Shop approved", shop: mapShop(shop) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: delete/reject a shop
const rejectShop = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.shop.delete({ where: { id } });
    res.json({ message: "Shop request rejected and deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getAllContacts,
  deleteUserById,
  getUserById,
  updateUserById,
  deleteContactById,
  getAllShops,
  deleteShopById,
  getShopById,
  updateShopById,
  getPendingShops,
  approveShop,
  rejectShop,
};
