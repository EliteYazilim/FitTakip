import express from "express";
import Users from "../db/models/usersModel.js";
import bcrypt from 'bcryptjs';
import validator from "validator";
import Response from "../lib/response.js";
import Enum from "../config/enum.js";
import CustomError from "../lib/error.js";
import checkPermission from "../middleware/checkpermission.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Tüm kullanıcıları getir
router.get("/", authMiddleware, checkPermission("user_view"), async (req, res) => {
    try {
        const users = await Users.find({})
            .populate({
                path: "role",
                model: "Roles",
                populate: {
                    path: "permissions",
                    model: "Permission"
                }
            });
        res.json(Response.successResponse(users));
    } catch (err) {
        res.json(Response.errorResponse(err));
    }
});

// Yeni kullanıcı oluştur
router.post("/", authMiddleware, checkPermission("user_add"), async (req, res) => {
    const body = req.body;
    try {
        if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email alanı dolu olmalı!");
        if (!validator.isEmail(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email doğru bir formatta olmalı!");

        if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Şifre alanı dolu olmalı!");
        if (body.password.length < Enum.PASSWORD_LENGTH) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", `Şifre uzunluğu en az ${Enum.PASSWORD_LENGTH} olmalı!`);
        }

        const existingUserMail = await Users.findOne({ email: body.email });
        if (existingUserMail) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "User Exists", "Bu email'e sahip bir kullanıcı zaten var!");

        const existingUsername = await Users.findOne({ username: body.username });
        if (existingUsername) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "User Exists", "Bu kullanıcı adı zaten kullanımda!");

        const hashedPassword = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));

        await Users.create({
            email: body.email,
            password: hashedPassword,
            username: body.username,
            role: body.role,
            weight: body.weight,
            height: body.height,
            age: body.age,
            gender: body.gender,
            goal: body.goal,
            activityLevel: body.activityLevel,
        });

        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
});

// Kullanıcı güncelle
router.put("/:id", authMiddleware, checkPermission("user_update"), async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    try {
        let updates = {};

        // ID kontrolü
        if (!id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id alanı dolu olmalı!");

        // Eğer şifre varsa, uzunluğunu kontrol et ve hashle
        if (body.password && body.password.length >= Enum.PASSWORD_LENGTH) {
            updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));
        }

        // Güncellenecek diğer alanlar
        if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
        if (body.email && validator.isEmail(body.email)) updates.email = body.email;
        if (body.username) updates.username = body.username;
        if (body.weight) updates.weight = body.weight;
        if (body.height) updates.height = body.height;
        if (body.age) updates.age = body.age;
        if (body.gender) updates.gender = body.gender;
        if (body.goal) updates.goal = body.goal;
        if (body.activityLevel) updates.activityLevel = body.activityLevel;
        if (body.role) updates.role = body.role;
        // Kullanıcıyı güncelle
        const result = await Users.updateOne({ _id: id }, updates);

        // Eğer ID'ye sahip kullanıcı bulunamadıysa
        if (result.matchedCount === 0) {
            throw new CustomError(Enum.HTTP_CODES.NOT_FOUND, "Kullanıcı bulunamadı!", "_id eşleşmedi.");
        }

        // Güncelleme yapılmışsa
        if (result.modifiedCount === 0) {
            return res.json(Response.successResponse({ success: false, message: "Veri zaten güncel." }));
        }

        res.json(Response.successResponse({ success: true, modified: result.modifiedCount > 0 }));
    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
});

router.delete("/:id", authMiddleware, checkPermission("user_delete"), async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Kullanıcı ID gerekli!");

        await Users.deleteOne({ _id: userId });

        res.json(Response.successResponse({ success: true }));
    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
});

export default router;
