import express from "express";
import Permissions from "../db/models/permissions.js";
import Enum from "../config/enum.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkPermission from "../middleware/checkpermission.js";
import Foods from "../db/models/foodsModel.js";

const router = express.Router();

router.get("/", authMiddleware, checkPermission("food_view"), async (req, res) => {
    try {
        const foods = await Foods.find();
        res.json(foods);
    } catch (error) {
        response.status(Enum.HTTP_CODES.INTERNAL_SERVER_ERROR).json({ message: "Yemekler getirilirken bir hata oluştu.", error: error.message });
    }
});

router.post("/", authMiddleware, checkPermission("food_add"), async (req, res) => {
    try {
        const { name, calories, protein, carbs, fat, quantity } = req.body;
        const food = await Foods.create({ name, calories, protein, carbs, fat, quantity });
        res.json(food);
    } catch (error) {
        res.status(500).json({
            message: "Yemek eklenirken bir hata oluştu.",
            error: error.message
        });
    }
});

router.put("/:id", authMiddleware, checkPermission("food_update"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, calories, protein, carbs, fat } = req.body;
        const food = await Foods.findByIdAndUpdate(id, { name, calories, protein, carbs, fat }, { new: true });
        res.json(food);
    } catch (error) {
        res.status(500).json({
            message: "Yemek güncellenirken bir hata oluştu.",
            error: error.message
        });
    }
});

router.delete("/:id", authMiddleware, checkPermission("food_delete"), async (req, res) => {
    try {
        const { id } = req.params;
        await Foods.findByIdAndDelete(id);
        res.json({ message: "Yemek başarıyla silindi." });
    } catch (error) {
        res.status(500).json({
            message: "Yemek silinirken bir hata oluştu.",
            error: error.message
        });
    }
});


export default router;
