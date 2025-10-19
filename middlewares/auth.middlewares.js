const jwt = require("jsonwebtoken");

const authMiddleware = (req,res,next) => {
    try {
        const auth = req.headers.authorization || "";

        const token = auth.startsWith("Bearer") ? auth.slice(7) :null;

        if (!token) {
            return res.status(401).json({
                ok:false,
                message:"Yetkisiz Erişim"
            })
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id:payload.id, email:payload.email, username:payload.username};
        next();
    } catch (error) {
        return res.status(401).json({
            ok:false,
            message:"Token Doğrulanmadı"
        })
    }
}

module.exports =authMiddleware;