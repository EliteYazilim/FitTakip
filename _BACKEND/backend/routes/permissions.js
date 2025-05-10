import express from "express";
import Permissions from "../db/models/permissions.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkPermission from "../middleware/checkpermission.js";
import Response from "../lib/response.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const permissions = await Permissions.find();
    res.json(Response.successResponse(permissions));
  } catch (err) {
    res.status(500).json(Response.errorResponse(err.message));
  }
});

// Yeni permission oluşturma (Sadece admin erişebilir)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { key, description } = req.body;

        if (!key) {
            return res.status(400).json(Response.errorResponse("Permission key gereklidir!"));
        }

        // Permission key benzersiz mi kontrolü
        const existingPermission = await Permissions.findOne({ key });
        if (existingPermission) {
            return res.status(400).json(Response.errorResponse("Bu permission zaten var!"));
        }

        const newPermission = await Permissions.create({ key, description });
        res.status(201).json(Response.successResponse(newPermission));
    } catch (err) {
        res.status(500).json(Response.errorResponse(err.message));
    }
});

export default router;