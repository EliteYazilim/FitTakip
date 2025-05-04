import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
    try {
        console.log(process.env.MONGO_URL)
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.log("Error connection to MongoDB")
        process.exit(1); // hata olursa çıksın.
    }
}