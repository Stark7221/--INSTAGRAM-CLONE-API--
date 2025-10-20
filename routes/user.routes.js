const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middlewares");
const {
  getAllUsers,
  getUserById,
  getUserByUsername,
  getMe,
  updateMe,
  updatePassword,
  deleteUser,
} = require("../controllers/user.controller");

// tüm kullanıcılar (test veya admin için)
router.get("/", authMiddleware, getAllUsers);

// id ile getir
router.get("/id/:id", authMiddleware, getUserById);

// username ile getir
router.get("/username/:username", authMiddleware, getUserByUsername);

// kendi bilgilerini getir
router.get("/me", authMiddleware, getMe);

// kendi profilini güncelle
router.patch("/me", authMiddleware, updateMe);

// kendi şifresini güncelle
router.patch("/me/password", authMiddleware, updatePassword);

// kullanıcı sil
router.delete("/:id", authMiddleware, deleteUser);

module.exports = router;
