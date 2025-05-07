import express from "express";
import Users from "../db/models/usersModel.js";
import bcrypt from 'bcryptjs'
import validator from "validator"
import Response from "../lib/response.js";
import Enum from "../config/enum.js";

const router = express.Router();

// get Users
router.get("/users", async (req, res) => {
    try {
        const users = await Users.find({});
        res.json(Response.successResponse(users));
    } catch (err) {
        res.json(Response.errorResponse(err));
    }
});

// add User
router.post("/userAdd", async (req, res) => {
    const body = req.body;
    try {

        // Email kontrolü
        if (!body.email) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email alanı dolu olmalı!");
        if (!validator.isEmail(body.email)) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Email doğru bir formatta olmalı!");

        // Şifre kontrolü
        if (!body.password) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "Şifre alanı dolu olmalı!");
        if (body.password.length < Enum.PASSWORD_LENGTH) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", `Şifre uzunluğu en az ${Enum.PASSWORD_LENGTH} olmalı!`);
        }

        // Kullanıcı var mı kontrolü
        const existingUserMail = await Users.findOne({ email: body.email });
        if (existingUserMail) {
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "User Exists", "Bu email'e sahip bir kullanıcı zaten var!");
        }

        const hashedPassword = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));

        let user = await Users.create({
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

        res.status(Enum.HTTP_CODES.CREATED).json(Response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
});

router.post("/userUpdate", async (req, res) => {
    const body = req.body;

    try {

        let updates = {}

        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "validation error!", "_id alanı dolu olmalı!")

        if (body.password && body.password.length >= Enum.PASSWORD_LENGTH) {
            updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));
        }

        if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
        if (body.email && validator.isEmail(body.email)) updates.email = body.email;
        if (body.username) updates.username = body.username;
        if (body.weight) updates.weight = body.weight;
        if (body.height) updates.height = body.height;
        if (body.age) updates.age = body.age;
        if (body.gender) updates.gender = body.gender;
        if (body.goal) updates.goal = body.goal;
        if (body.activityLevel) updates.activityLevel = body.activityLevel;

        await Users.updateOne({ _id: body._id }, updates);

        res.json(Response.successResponse({ success: true }))
    } catch (error) {
        const errorRes = Response.errorResponse(error);
        res.status(errorRes.code).json(errorRes);
    }
});

router.post("/userDelete", async (req, res) => {
    try {
        const body = req.body;

        if (!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, "Validation Error!", "_id alanı dolu olmalı!");

        await Users.deleteOne({ _id: body._id });

        res.json(Response.successResponse({ success: true }));

    } catch (err) {
        const errorRes = Response.errorResponse(err);
        res.status(errorRes.code).json(errorRes);
    }
})

export default router;
