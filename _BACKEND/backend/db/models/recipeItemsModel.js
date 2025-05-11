import mongoose from "mongoose";

const recipeItemSchema = new mongoose.Schema({
    recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
        required: true,
    },
    foodId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true,
    }],
    quantity: {
        type: Number,
        required: true,
    },
});

export default mongoose.model("RecipeItem", recipeItemSchema); 