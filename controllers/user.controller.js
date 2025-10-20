const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 1️⃣ Tüm kullanıcıları listele (sadece test veya admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// 2️⃣ Belirli bir kullanıcıyı ID ile getir
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// 3️⃣ username ile kullanıcıyı getir
exports.getUserByUsername = async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username }).select("-password -__v");
    if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("getUserByUsername error:", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// 4️⃣ Oturum açan kullanıcının bilgilerini getir (GET /me)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");
    if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// 5️⃣ Kullanıcı bilgilerini güncelle (PATCH /me)
exports.updateMe = async (req, res) => {
  try {
    const allowed = ["fullName", "username", "email", "bio", "profilePicture"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      select: "-password -__v",
    });

    if (!updatedUser) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    return res.status(200).json({ success: true, message: "Profil güncellendi", data: updatedUser });
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// 6️⃣ Şifre güncelle
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Mevcut ve yeni şifre zorunludur" });

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Mevcut şifre hatalı" });

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ success: true, message: "Şifre güncellendi" });
  } catch (err) {
    console.error("updatePassword error:", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// 7️⃣ Kullanıcı sil (admin veya kendisi)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id !== id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Bu kullanıcıyı silme yetkin yok" });
    }
    await User.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Kullanıcı silindi" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};
