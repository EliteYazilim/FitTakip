import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Enum from "../config/enum.js";

dotenv.config();

export default function (req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(Enum.HTTP_CODES.UNAUTHORIZED).json({ message: 'Token yok, yetkisiz.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // payload içindeki user bilgisi
        next();
    } catch (err) {
        res.status(Enum.HTTP_CODES.BAD_REQUEST).json({ message: 'Geçersiz token.' });
    }
};
