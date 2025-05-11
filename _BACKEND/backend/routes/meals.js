import express from "express";
import Meals from "../db/models/mealsModel.js";
import Enum from "../config/enum.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkPermission from "../middleware/checkpermission.js";
import Foods from "../db/models/foodsModel.js";
import response from "../lib/response.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", authMiddleware, checkPermission("meal_view"), async (req, res) => {
    try {
        const meals = await Meals.find().populate("foods");
        res.json(response.successResponse(meals, Enum.HTTP_CODES.OK));
    } catch (error) {
        response.errorResponse(error);
    }
});

router.post("/", authMiddleware, checkPermission("meal_add"), async (req, res) => {
    try {
        const { name} = req.body;
        const userId = req.user.id;
        const meal = await Meals.create({ userId, name });
        res.json(response.successResponse({ success: true }, Enum.HTTP_CODES.CREATED));
    } catch (error) {
        response.errorResponse(error);
    }
});

router.put("/:id", authMiddleware, checkPermission("meal_update"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, totalCalories, totalProtein, totalCarbs, totalFat } = req.body;
        const meal = await Meals.findByIdAndUpdate(id, { name, totalCalories, totalProtein, totalCarbs, totalFat }, { new: true });
        res.json(response.successResponse(meal, Enum.HTTP_CODES.OK));
    } catch (error) {       
        response.errorResponse(error);
    }
});

router.delete("/:id", authMiddleware, checkPermission("meal_delete"), async (req, res) => {
    try {
        const { id } = req.params;
        await Meals.findByIdAndDelete(id);
        res.json(response.successResponse({ message: "Öğün başarıyla silindi." }, Enum.HTTP_CODES.OK));
    } catch (error) {
        response.errorResponse(error);
    }
});

router.post("/:mealId/add-foods", authMiddleware, async (req, res) => {
    try {
        const { mealId } = req.params;
        const { foodIds } = req.body;

        if (!Array.isArray(foodIds) || foodIds.length === 0) {
            return res.status(400).json({ message: "foodIds zorunludur ve dizi olmalıdır." });
        }

        const meal = await Meals.findById(mealId);
        if (!meal) return res.status(404).json({ message: "Öğün bulunamadı" });

        const foods = await Foods.find({ _id: { $in: foodIds } });
        if (foods.length !== foodIds.length) {
            return res.status(400).json({ message: "Bazı yemekler bulunamadı.", found: foods.map(f => f._id) });
        }

        let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
        foods.forEach(food => {
            totalCalories += food.calories;
            totalProtein += food.protein;
            totalCarbs += food.carbs;
            totalFat += food.fat;
        });

        // Çift eklemeyi önle (opsiyonel)
        if (!Array.isArray(meal.foods)) meal.foods = [];
        const uniqueFoodIds = foodIds.filter(id => !meal.foods.includes(id));
        meal.foods.push(...uniqueFoodIds);

        // Eğer değerler undefined ise 0 olarak başlat
        meal.totalCalories = meal.totalCalories || 0;
        meal.totalProtein = meal.totalProtein || 0;
        meal.totalCarbs = meal.totalCarbs || 0;
        meal.totalFat = meal.totalFat || 0;

        meal.totalCalories += totalCalories;
        meal.totalProtein += totalProtein;
        meal.totalCarbs += totalCarbs;
        meal.totalFat += totalFat;

        await meal.save();
        res.json(response.successResponse(meal, Enum.HTTP_CODES.OK));
    } catch (error) {
        res.status(500).json({ message: "Bir hata oluştu.", error: error.message });
    }
});

export default router;

