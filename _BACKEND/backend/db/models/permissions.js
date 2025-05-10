import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    description: { type: String }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

export default mongoose.model("Permission", permissionSchema);