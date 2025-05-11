import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    foods: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        default: []
    }],
    totalCalories: {
        type: Number,
        default: 0
    },
    totalProtein: {
        type: Number,
        default: 0
    },
    totalCarbs: {
        type: Number,
        default: 0
    },
    totalFat: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Meal", mealSchema);