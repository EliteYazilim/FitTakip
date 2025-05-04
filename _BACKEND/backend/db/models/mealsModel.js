import mongoose from "mongoose";

const mealModelSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // users modelin exportuyla aynı.
        required: true,
    },
    name: { type: String, required: true },
    time: { type: String, },
    totalCalories: { type: Number, default: 0 },
    mealItems: [{
        itemType: {
            type: String,
            enum: ["food", "recipe"],
            required: true,
        },
        itemID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            rafPath: "mealItems.itemType",
        },
        quantity: {
            type: Number,
            default: 1,
        },
    }],
})

export default mongoose.model("mealModel", mealModelSchema)