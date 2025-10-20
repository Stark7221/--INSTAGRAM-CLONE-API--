const multer = require("multer");

const storage = multer.memoryStorage(); // bellekte tutma işlemi cloud a stream olarak yükleyecez

const fileFilter = (req,res,cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"];
    if (allowed.includes(fileFilter.mimtype)) cb(null,true);
    else cb(new Error("Sadece resim veya video yükleyebilirsiniz"),false);
};

//boyut limiti belirleme işlemi
const upload = multer({
    storage,
    fileFilter,
    limits:{fileSize:20*1024*1024}
});

module.exports = upload;