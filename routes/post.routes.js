const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middlewares");
const upload = require("../middlewares/upload.middleware");
const {
  createPost,
  getPost,
  deletePost,
  getUserPosts,
  getFeed,
  toggleLike,
} = require("../controllers/post.controller");

// Tek medya (image/video) + caption
router.post("/", authMiddleware, upload.single("media"), createPost);

// Detay & silme
router.get("/:id", authMiddleware, getPost);
router.delete("/:id", authMiddleware, deletePost);

// Kullanıcı postları
router.get("/user/:userId", authMiddleware, getUserPosts);

// Like / Unlike toggle
router.patch("/:id/like", authMiddleware, toggleLike);

module.exports = router;
