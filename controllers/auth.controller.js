const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req,res) => {
    try {
        const {fullName, username, password, email, bio, profilPicture} = req.body;

        if (!fullName || !username || !password || !email) {
            return res.status(400).json({
                success:false,
                message:"Belirtilen alanlar zoruludur"
            })
        }

        const existingEmail = await User.findOne({email})

        //benzersiz kullanıcı kontrolu
        if (existingEmail) {
            return res.status(400).json({
                success:false,
                message:"Girilen Email Adresi sistemde kayıtlıdır"
            })
        }

        //parola hashleme
        const hashedPass = await bcrypt.hash(password,10);

        const user = new User({
            fullName,
            username,
            password:hashedPass,
            email,
            bio,
            profilPicture
        })
        //parola dışarı gitmesin diye
        const userObj = user.toObject();
        delete userObj.password;

        //kaydetme
        await user.save();

        return res.status(200).json({
            success:true,
            message:"kullanıcı oluşturuldu",
            data:userObj
        })
    } catch (error) {
        console.log("Register error", error);
        return res.status(500).json({
            success:false,
            message:"Internaş Server Error"
        })
        
    }
}

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email ve şifre zorunludur" });
    }

    // normalize
    email = String(email).trim().toLowerCase();

    // Şemanda password alanı `select: false` ise mutlaka +password ile seç
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "Girilen email ile kullanıcı bulunamadı" });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Şifre hatalı" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET tanımlı değil!");
      return res.status(500).json({ success: false, message: "Sunucu yapılandırma hatası" });
    }

    // JWT üret
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Parolayı dışarı sızdırma
    const userObj = user.toObject();
    delete userObj.password;
    
    return res.status(200).json({
      success: true,
      message: "Giriş başarılı",
      token,
      data: userObj,
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
    register,
    login
}