import express from "express";
import jwt from "jsonwebtoken";
import Users from "../db/models/usersModel.js";
import bcrypt from 'bcryptjs';

const router = express.Router();

// Kayıt
router.post("/register", async (req, res) => {
    const body = req.body;
    
    // Password kontrolü
    if (!body.password) {
        return res.status(400).json({ message: "Şifre gerekli" });
    }

    const existingUser = await Users.findOne({ username: body.username, email: body.email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(body.password, 10); // async version
    const newUser = new Users({
        email: body.email,
        password: hashedPassword,
        username: body.username,
        weight: body.weight,
        height: body.height,
        age: body.age,
        gender: body.gender,
        goal: body.goal,
        activityLevel: body.activityLevel,
    });

    await newUser.save();
    res.json({ message: 'Kayıt başarılı.' });
});

// Giriş
router.post("/login", async (req, res) => {
    const body = req.body;

    // email veya username ile kullanıcıyı bul
    const user = await Users.findOne({
        $or: [
            { email: body.email },    // Email ile eşleşme
            { username: body.username } // Veya Username ile eşleşme
        ]
    });

    if (!user) return res.status(400).json({ message: "Şifre veya Kullanıcı Adı/Email hatalı!" });

    // Şifreyi kontrol et
    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Şifre veya Kullanıcı Adı/Email hatalı!" });

    // JWT Token oluştur
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    res.json({ token });
});

export default router;
