import express from "express";
import jwt from "jsonwebtoken";
import Users from "../db/models/usersModel.js";
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Enum from "../config/enum.js";
import crypto from 'crypto';
import TokenBlacklist from "../db/models/tokenBlacklistModel.js";
import authMiddleware from "../middleware/authMiddleware.js";

dotenv.config();

const router = express.Router();

// Token oluşturma yardımcı fonksiyonu
const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    return { accessToken, refreshToken };
};

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
    const { identifier, password } = req.body;

    const user = await Users.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
        return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: "Kullanıcı bulunamadı." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: "Şifre hatalı." });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Refresh token'ı veritabanına kaydet
    user.refreshToken = refreshToken;
    await user.save();

    res.json({ 
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
});

// Refresh token ile yeni access token alma
router.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: "Refresh token gerekli." });
    }

    const user = await Users.findOne({ refreshToken });
    if (!user) {
        return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json({ message: "Geçersiz refresh token." });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Yeni refresh token'ı veritabanına kaydet
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ 
        accessToken,
        refreshToken: newRefreshToken
    });
});

// Çıkış yap
router.post("/logout", authMiddleware, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const accessToken = req.header('Authorization')?.split(' ')[1];

        if (!refreshToken || !accessToken) {
            return res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: "Refresh token ve access token gerekli." });
        }

        // Refresh token'ı veritabanından sil
        const user = await Users.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        // Access token'ı blacklist'e ekle
        const decoded = jwt.decode(accessToken);
        await TokenBlacklist.create({
            token: accessToken,
            expiresAt: new Date(decoded.exp * 1000) // JWT exp değerini Date'e çevir
        });

        res.json({ message: "Başarıyla çıkış yapıldı." });
    } catch (err) {
        res.status(Enum.HTTP_CODES.INTERNAL_SERVER_ERROR).json({ message: "Çıkış yapılırken bir hata oluştu." });
    }
});

export default router;