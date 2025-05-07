import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Korunan bir rota örneği
app.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: `Hoşgeldin, ${req.user.username}` });
});

// Dinamik route yükleme
async function loadRoutes() {
    const routesPath = path.join(__dirname, "routes");
    const files = fs.readdirSync(routesPath);

    for (const file of files) {
        if (file.endsWith(".js")) {
            const routeName = file.replace(".js", "");
            const routeModule = await import(`./routes/${file}`);
            app.use(`/api/${routeName}`, routeModule.default);
        }
    }
}

app.get("/", (req, res) => {
    res.send("FitTakip Backend API çalışıyor!");
});

app.listen(3000, async () => {
    await connectDB();
    await loadRoutes();
    console.log("Server is running on port 3000");
});
