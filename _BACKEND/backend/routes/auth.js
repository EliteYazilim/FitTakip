import express from "express";
import jwt from "jsonwebtoken";
import Users from "../db/models/usersModel.js";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Enum from "../config/enum.js";

dotenv.config();

const router = express.Router();

// Kayıt
router.post("/register", async (req, res) => {
    const body = req.body;

    // Şifre kontrolü ve minimum karmaşıklık
    if (!body.password || body.password.length < Enum.PASSWORD_LENGTH || !/[A-Z]/.test(body.password) || !/[a-z]/.test(body.password) || !/[0-9]/.test(body.password)) {
        return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: "Şifre en az 8 karakter, büyük harf, küçük harf ve rakam içermelidir." });
    }

    // Username veya email var mı?
    const existingUser = await Users.findOne({
        $or: [
            { username: body.username },
            { email: body.email }
        ]
    });

    if (existingUser) return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: "Bu kullanıcı adı veya e-posta zaten kayıtlı." });

    const hashedPassword = await bcrypt.hash(body.password, 10);
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
    const { identifier, password } = req.body; // Tek alanla giriş: username veya email

    const user = await Users.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });

    if (!user) return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: "Kullanıcı bulunamadı." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: "Şifre hatalı." });

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET tanımlı değil." });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
});

export default router;