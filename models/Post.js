const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    mediaUrl:{
        type:String,
        required:true,
    },//cloudianry url
    mediaPublicId:{
        type:String,
        required:true
    },//silme işlemi için
    mediaType:{
        type:String,
        enum:["image","video"],
        required:true
    },
    caption:{
        type:String,
        maxLenght:2200,
        default:""
    },
    likes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"User",
        default:[]
    }
},
{timestamps:true}
);

module.exports = mongoose.model("Post", postSchema)