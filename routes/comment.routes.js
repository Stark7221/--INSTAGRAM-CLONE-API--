const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middlewares");
const {
  createComment,
  getCommentsByPost,
  deleteComment,
  countComments,
  toggleCommentLike,
} = require("../controllers/comment.controller");

// Yorum oluştur
router.post("/:postId", authMiddleware, createComment);

// Yorumları getir (sayfalı)
router.get("/:postId", authMiddleware, getCommentsByPost);

// Yorum sayısı
router.get("/:postId/count", authMiddleware, countComments);

// Yorum sil
router.delete("/:commentId", authMiddleware, deleteComment);

router.patch("/:commentId/like", authMiddleware, toggleCommentLike);

module.exports = router;
