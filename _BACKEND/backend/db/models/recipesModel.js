import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    totalCalories: {
        type: Number,
        required: true,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
});

export default mongoose.model("Recipe", recipeSchema);