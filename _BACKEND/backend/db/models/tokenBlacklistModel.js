import mongoose from "mongoose";

const schema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

// Token'ın süresi dolduğunda otomatik silinmesi için TTL index
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("tokenBlacklist", schema); 