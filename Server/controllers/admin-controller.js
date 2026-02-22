const User = require("../models/user/user-model");
const Contact = require("../models/contact-model")
const Shop = require("../models/registerShop-model")

// LOGIC TO GET ALL USERS IN ADMIN
const getAllUsers = async(req,res) => {
    try {
        const users = await User.find({},{password:0});
        console.log(users);
        if(!users || users.length===0){
            return res.status(404).json({message:"No users found"});
        }
        return res.status(200).json(users);
    } catch (error) {
        // next(error);
        console.log(error)
    }
}

// LOGIC TO GET SINGLE USER DATA USING ADMIN USERS    
const getUserById = async(req,res) => {
    try {
        const id = req.params.id;
        const data = await User.findOne({_id: id}, {password: 0});
        return res.status(200).json(data);
        // return res.status(200).json({message:"User updated successfully"});
    } catch (error) {
        // next(error)
        console.log(error)
    }
}

// USER UPDATE LOGIC 
const updateUserById = async(req,res) => {
    try {
        const id = req.params.id;
        const updatedUserData = req.body;
        const updatedData = await User.updateOne({_id:id},{$set: updatedUserData});
        return res.status(200).json(updatedData);
    } catch (error) {
        // next(error);
        console.log(error)
    }
}

// LOGIC TO DELETE USER FROM ADMIN USERS    
const deleteUserById = async(req,res) => {
    try {
        const id = req.params.id;
        await User.deleteOne({_id:id});
        return res.status(200).json({message:"User deleted successfully"});
    } catch (error) {
        // next(error)
        console.log(error)
    }
}

// LOGIC TO GET ALL CONTACTS IN ADMIN
const getAllContacts = async(req,res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
        if (!contacts || contacts.length === 0) {
            return res.status(404).json({message:"No Contacts found"});
        }

        // Enrich contacts with usertype via user email lookup.
        const contactEmails = contacts
            .map((contact) => (contact.email || "").toLowerCase().trim())
            .filter(Boolean);

        const users = await User.find(
            { email: { $in: contactEmails } },
            { email: 1, usertype: 1, _id: 0 }
        ).lean();

        const userTypeByEmail = new Map(
            users.map((user) => [(user.email || "").toLowerCase().trim(), user.usertype || "customer"])
        );

        const contactsWithUserType = contacts.map((contact) => {
            const normalizedEmail = (contact.email || "").toLowerCase().trim();
            return {
                ...contact,
                usertype: userTypeByEmail.get(normalizedEmail) || "guest",
            };
        });

        return res.status(200).json(contactsWithUserType);
    } catch (error) {
        // next(error);
        console.log(error)
    }
}

// LOGIC TO DELETE CONTACT USING ADMIN    
const deleteContactById = async(req,res) => {
    try {
        const id = req.params.id;
        await Contact.deleteOne({_id:id});
        return res.status(200).json({message:"Contact deleted successfully"});
    } catch (error) {
        // next(error)
        console.log(error)
    }
}

// LOGIC TO GET ALL SHOPS IN ADMIN
const getAllShops = async(req,res) => {
    try {
        const shops = await Shop.find({ isApproved: true }, { password: 0 }).sort({ createdAt: -1 });
        // Return empty list instead of 404 so frontend can render empty state.
        return res.status(200).json(Array.isArray(shops) ? shops : []);
    } catch (error) {
        // next(error);
        console.log(error);
        return res.status(500).json({ message: "Failed to fetch shops", error: error.message });
    }
}

// LOGIC TO GET SINGLE SHOP DATA USING ADMIN USERS    
const getShopById = async(req,res) => {
    try {
        const id = req.params.id;
        const data = await Shop.findOne({_id: id}, {password: 0});
        return res.status(200).json(data);
        // return res.status(200).json({message:"User updated successfully"});
    } catch (error) {
        // next(error)
        console.log(error)
    }
}

// SHOP UPDATE LOGIC 
const updateShopById = async(req,res) => {
    try {
        const id = req.params.id;
        const updatedShopData = req.body;
        // console.log("from admin controller before updating ",updatedShopData);
        const updatedData = await Shop.updateOne({_id:id},{$set: updatedShopData});
        return res.status(200).json(updatedData);
    } catch (error) {
        // next(error);
        console.log(error)
    }
}

// LOGIC TO DELETE SHOP FROM ADMIN USERS    
const deleteShopById = async(req,res) => {
    try {
        const id = req.params.id;
        await Shop.deleteOne({_id:id});
        return res.status(200).json({message:"Shop deleted successfully"});
    } catch (error) {
        // next(error)
        console.log(error)
    }
}

// Admin: get all pending (unapproved) shops
const getPendingShops = async (req, res) => {
  try {
    const pendingShops = await Shop.find({ isApproved: false }).sort({ createdAt: -1 });
    res.status(200).json(Array.isArray(pendingShops) ? pendingShops : []);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending shops", error: err.message });
  }
};

// Admin: approve a shop
const approveShop = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ message: "Shop approved", shop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: delete/reject a shop
const rejectShop = async (req, res) => {
  try {
    const { id } = req.params;
    await Shop.findByIdAndDelete(id);
    res.json({ message: "Shop request rejected and deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {getAllUsers,getAllContacts,deleteUserById,
    getUserById,updateUserById,deleteContactById,getAllShops,
    deleteShopById,getShopById,updateShopById,getPendingShops,
    approveShop,rejectShop};
