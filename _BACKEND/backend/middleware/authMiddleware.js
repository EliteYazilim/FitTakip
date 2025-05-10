import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Enum from "../config/enum.js";
import TokenBlacklist from "../db/models/tokenBlacklistModel.js";

dotenv.config();

export default async function (req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json({ message: 'Token yok, yetkisiz.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json({ message: 'Token yok, yetkisiz.' });

    try {
        // Token'ın blacklist'te olup olmadığını kontrol et
        const blacklistedToken = await TokenBlacklist.findOne({ token });
        if (blacklistedToken) {
            return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json({ message: 'Token geçersiz.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // payload içindeki user bilgisi
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json({ 
                message: 'Token süresi doldu.',
                code: 'TOKEN_EXPIRED'
            });
        }
        res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: 'Geçersiz token.' });
    }
};
