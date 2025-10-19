const express = require("express");
const dotenv = require("dotenv")
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth.routes")
const followRoutes = require("./routes/follow.routes")

const app = express();

const PORT = 5000;
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());


app.use("/api/auth",authRoutes);
app.use("/api/users",followRoutes);


//veritabanı bağlantısı
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE).then(()=>{
            console.log("veritabanına bağlandı");
        })
    } catch (error) {
        console.log("Veritabanı bağlantı hatası");
        console.log(error.message);
    }
}

app.listen(PORT,()=>{
    connect();
    console.log(`Server running on ${PORT}`);
})