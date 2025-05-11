import mongoose from "mongoose";

const mealItemSchema = new mongoose.Schema({
    itemType: {
        type: String,
        enum: ["food", "recipe"],
        required: true,
    },
})

const MealItem = mongoose.model('MealItem', mealItemSchema);
