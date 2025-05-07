import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function (req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token yok, yetkisiz.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // payload içindeki user bilgisi
        next();
    } catch (err) {
        res.status(400).json({ message: 'Geçersiz token.' });
    }
};
