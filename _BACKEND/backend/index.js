import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// dosya isimlerini alıyor
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// örnek "http://localhost:3000/api/users"
// Route'ları dinamik olarak yükleyen fonksiyon
async function loadRoutes() {
    const routesPath = path.join(__dirname, "routes");
    const files = fs.readdirSync(routesPath);

    for (const file of files) {
        if (file.endsWith(".js")) {
            const routeModule = await import(`./routes/${file}`);
            app.use("/api", routeModule.default); 
        }
    }
}

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello world 123!");
});

app.listen(3000, async () => {
    connectDB();
    await loadRoutes();
    console.log("Server is running on port 3000");
});
