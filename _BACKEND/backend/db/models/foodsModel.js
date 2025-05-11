import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    calories: {
        type: Number,
        required: true,
    },
    protein: {
        type: Number,
        required: true,
    },
    carbs: {
        type: Number,
        required: true,
    },
    fat: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

export default mongoose.model("Food", foodSchema); 