import mongoose from "mongoose";

const schema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    description: { type: String }
}, {
    timestamps: true
});

export default mongoose.model("Permission", schema);