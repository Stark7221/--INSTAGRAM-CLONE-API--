const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Yorum oluştur
// POST /api/comments/:postId { text }
exports.createComment = async (req, res) => {
  try {
    const { text } = req.body || {};
    const { postId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Yorum metni zorunlu" });
    }

    // Post var mı?
    const post = await Post.findById(postId).select("_id userId");
    if (!post) return res.status(404).json({ success: false, message: "Post bulunamadı" });

    const comment = await Comment.create({
      postId,
      userId: req.user.id,
      text: text.trim(),
    });

    return res.status(201).json({ success: true, data: comment });
  } catch (e) {
    console.error("createComment error:", e);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// Yorumları getir (sayfalama)
// GET /api/comments/:postId?page=1&limit=10
exports.getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Post var mı? 
    const exist = await Post.exists({ _id: postId });
    if (!exist) return res.status(404).json({ success: false, message: "Post bulunamadı" });

    const [items, total] = await Promise.all([
      Comment.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username fullName profilePicture"),
      Comment.countDocuments({ postId }),
    ]);

    return res.json({ success: true, page, limit, total, data: items });
  } catch (e) {
    console.error("getCommentsByPost error:", e);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// Yorum sil (sadece yorum sahibi veya post sahibi)
// DELETE /api/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Yorum bulunamadı" });

    const post = await Post.findById(comment.postId).select("userId");
    if (!post) return res.status(404).json({ success: false, message: "Post bulunamadı" });

    const isCommentOwner = comment.userId.toString() === req.user.id;
    const isPostOwner = post.userId.toString() === req.user.id;

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ success: false, message: "Bu yorumu silme yetkin yok" });
    }

    await comment.deleteOne();
    return res.json({ success: true, message: "Yorum silindi" });
  } catch (e) {
    console.error("deleteComment error:", e);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// Yorum sayısı
// GET /api/comments/:postId/count
exports.countComments = async (req, res) => {
  try {
    const total = await Comment.countDocuments({ postId: req.params.postId });
    return res.json({ success: true, total });
  } catch (e) {
    console.error("countComments error:", e);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// PATCH /api/comments/:commentId/like
exports.toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId).select("likes");
    if (!comment) return res.status(404).json({ success: false, message: "Yorum bulunamadı" });

    const liked = comment.likes.some(id => id.toString() === userId);
    if (liked) {
      await Comment.updateOne({ _id: commentId }, { $pull: { likes: userId } });
      return res.json({ success: true, liked: false });
    } else {
      await Comment.updateOne({ _id: commentId }, { $addToSet: { likes: userId } });
      return res.json({ success: true, liked: true });
    }
  } catch (e) {
    console.error("toggleCommentLike error:", e);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};
