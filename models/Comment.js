const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Post", required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    text: { 
        type: String, 
        required: true, 
        maxlength: 1000, trim: true 
    },
    likes: { 
        type: [mongoose.Schema.Types.ObjectId], 
        ref: "User", 
        default: [] 
    }, 
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
