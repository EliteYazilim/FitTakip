import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "./middleware/authMiddleware.js";
import Response from "./lib/response.js";
import Users from "./db/models/usersModel.js";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dinamik route yükleme işlemi
async function loadRoutes() {
    const routesPath = path.join(__dirname, "routes");
    const files = fs.readdirSync(routesPath);

    for (const file of files) {
        if (file.endsWith(".js")) {
            const routeName = file.replace(".js", "");
            try {
                const routeModule = await import(`./routes/${file}`);
                app.use(`/api/${routeName}`, routeModule.default);
            } catch (error) {
                console.error(`Error loading route ${file}:`, error);
            }
        }
    }
}

// Test route
app.get("/", (req, res) => {
    res.send("FitTakip Backend API çalışıyor!");
});

// Auth test
app.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: `Hoşgeldin, ${req.user.username}` });
});

app.get("/user/profile", authMiddleware, async (req, res) => {
    try {
        console.log("Kullanıcı ID:", req.user.id);
        const user = await Users.findById(req.user.id); // Kullanıcıyı veritabanından bul
        res.json({ 
            username: user.username,
            weight: user.weight,
            height: user.height,
            goal: user.goal
        });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ message: "Kullanıcı verileri alınamadı" });
    }
});

// Hata yönetimi için merkezi bir middleware eklemek isteyebilirsiniz
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        console.error(err.stack); // Geliştirme ortamında stack trace göster
    }
    res.status(err.status || 500).json(Response.errorResponse(err));
});

// Sunucu başlatma
app.listen(3000, async () => {
    try {
        await connectDB();  // Veritabanına bağlanma
        await loadRoutes(); // Dinamik route yükleme
        console.log("Server is running on port 3000");
    } catch (error) {
        console.error("Server startup error:", error);
    }
});
