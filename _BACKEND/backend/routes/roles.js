import express from "express";
import Roles from "../db/models/roles.js";
import Permissions from "../db/models/permissions.js";
import Enum from "../config/enum.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkPermission from "../middleware/checkpermission.js";

const router = express.Router();

// Tüm rolleri listele
router.get("/", authMiddleware, async (req, res) => {
    const roles = await Roles.find().populate("permissions");
    res.json(roles);
});

router.post("/", authMiddleware, async (req, res) => {
    const { name, permissions } = req.body;
    const role = new Roles({ name, permissions });
    await role.save();
    res.json(role);
});

export default router;
