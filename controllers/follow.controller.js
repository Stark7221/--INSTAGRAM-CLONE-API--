const User = require("../models/User");

//bir kullanıcıyı takip etme endpointi
const followUser = async (req,res) => {
    try {
        const targetId = req.params.id; //takip edilecek kişinin id si
        const currentUserId = req.user.id // oturumu açık olan kişinin id si

        if (targetId === currentUserId) return res.status(400).json({success:false, message:"kendini takip edemezsin"})

        const userToFollow = await User.findById(targetId);
        const currentUser = await User.findById(currentUserId);
        
        if (!userToFollow || !currentUser) return res.status(400).json({success:false, message:"Kullanıcı bulunumadı"})

        if (userToFollow.followers.includes(currentUserId)) return res.status(400).json({success:false, message:"Zaten takip ediyorsun"});

        //takip etme işlemleri
        await userToFollow.updateOne({$push:{followers:currentUserId}});//takip edilen kişinin beni takip edenlerine takip eden o anki kullanıcı eklendi
        await currentUser.updateOne({$push:{followings:targetId}});//o anki kullanıcının takip ettiklerine eklendi

        return res.status(200).json({success:true, message:"Kullanıcı takip edildi"});
        
    } catch (error) {
        console.log("followUser error", error);
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

//bir kullanıcıyı takipten çıkma
const unfollowUser = async (req,res) => {
    try {
        const targetId = req.params.id;
        const currentUserId = req.user.id;

        if (targetId === currentUserId) return res.status(400).json({success:false, message:"Kendini takipten çıkamazsın"});

        const userToUnfollow = await User.findById(targetId);
        const currentUser = await User.findById(currentUserId);

        if (!userToUnfollow || !currentUser) return res.status(400).json({success:false, message:"Kullanıcı bulunumadı"});

        if (!userToUnfollow.followers.includes(currentUser)) return res.status(400).json({success:false, message:"Kullanıcıyı zaten takip etmiyorsun"});

        //takipten çıkma işlemi
        await userToUnfollow.updateOne({$pull:{followers:currentUserId}});
        await currentUser.updateOne({$pull:{followings:targetId}});

        return res.status(200).json({success:true, message:"Kullanıcı başarılı bir şekilde takipten çıkarıldı"});

    } catch (error) {
        console.log("unfollowUser error",error);
        return res.status(500).json({success:false, message:"Internal server error"})
    }
}

//belirli bir kullanıcının takipçilerini getirme
const getFollowers = async (req,res) => {
    try {
    const user = await User.findById(req.params.id).populate("followers", "username fullName profilePicture");
    if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });

    return res.status(200).json({ success: true, followers: user.followers });

  } catch (error) {
    console.log("getFollowers error:", error);
    return res.status(500).json({ success: false, message: "Internal Server error" });
  }
}

//belirli bir kişinin takip ettiklerini getir
const getFollowings = async(req,res) => {
    try {
    const user = await User.findById(req.params.id).populate("followings", "username fullName profilePicture");
    if (!user) return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });

    return res.status(200).json({ success: true, followings: user.followings });

  } catch (error) {
    console.log("getFollowings error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowings
}