const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const Post = require("../models/Post");
const User = require("../models/User");

// Cloudinary'ye buffer'ı stream olarak yükle
function uploadToCloudinary(buffer, folder = "instagram_clone/posts") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // image/video otomatik
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// POST /api/posts  (tek medya + caption)
exports.createPost = async (req, res) => {
  try {
    const { caption = "" } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Medya zorunludur" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    const mediaType = result.resource_type === "video" ? "video" : "image";

    const post = await Post.create({
      userId: req.user.id,
      mediaUrl: result.secure_url,
      mediaPublicId: result.public_id,
      mediaType,
      caption: String(caption).slice(0, 2200),
    });

    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.log("createPost error:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// GET /api/posts/:id  (tek post detay)
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "username fullName profilePicture");
    if (!post) return res.status(404).json({ success: false, message: "Post bulunamadı" });
    return res.json({ success: true, data: post });
  } catch (error) {
    console.error("getPost error:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// DELETE /api/posts/:id  (sadece sahibi)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post bulunamadı" });

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Bu postu silme yetkin yok" });
    }

    // önce Cloudinary
    try {
      await cloudinary.uploader.destroy(post.mediaPublicId, {
        resource_type: post.mediaType === "video" ? "video" : "image",
      });
    } catch (e) {
      // Cloudinary'de yoksa bile DB'den siliyoruz
      console.warn("Cloudinary destroy warn:", e?.message);
    }

    await post.deleteOne();
    return res.json({ success: true, message: "Post silindi" });
  } catch (error) {
    console.error("deletePost error:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// GET /api/posts/user/:userId  (kullanıcının postları, basit sayfalama)
exports.getUserPosts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ userId: req.params.userId });

    return res.json({
      success: true,
      page,
      limit,
      total,
      data: posts,
    });
  } catch (error) {
    console.error("getUserPosts error:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};

// PATCH /api/posts/:id/like (toggle like)
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId).select("likes");
    if (!post) return res.status(404).json({ success: false, message: "Post bulunamadı" });

    const liked = post.likes.some(id => id.toString() === userId);
    if (liked) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      return res.json({ success: true, liked: false });
    } else {
      await Post.updateOne({ _id: postId }, { $addToSet: { likes: userId } });
      return res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error("toggleLike error:", error);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
  }
};
