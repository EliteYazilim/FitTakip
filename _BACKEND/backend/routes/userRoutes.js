import express from "express";
import Users from "../db/models/usersModel.js";
import bcrypt from 'bcryptjs'


const router = express.Router();

// get Users
router.get("/users", async (req, res) => {
    try {
        const users = await Users.find({});
        res.json(users); // Cevap dönmeyi unutmamalısın
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası" });
    }password
});

// add User
router.post("/userAdd", async (req,res) => {
    const body = req.body;

    try {
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

        res.status(201).json({ message: "Kullanıcı oluşturuldu", user });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Kullanıcı oluşturulamadı" });
    }
});


export default router;
