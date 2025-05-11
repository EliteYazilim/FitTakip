import express from "express";
import Permissions from "../db/models/permissions.js";
import Enum from "../config/enum.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkPermission from "../middleware/checkpermission.js";

const router = express.Router();

// Tüm yetkileri listele
router.get("/", authMiddleware, async (req, res) => {
    try {
        const permissions = await Permissions.find();
        res.json(permissions);
    } catch (err) {
        res.status(500).json({ message: "Yetkiler listelenirken bir hata oluştu." });
    }
});

// Yeni yetki oluştur
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { name, key, description } = req.body;

        // Yetki anahtarı kontrolü
        const existingPermission = await Permissions.findOne({ key });
        if (existingPermission) {
            return res.status(400).json({ message: "Bu yetki anahtarı zaten kullanımda." });
        }

        const permission = new Permissions({ name, key, description });
        await permission.save();

        res.status(201).json(permission);
    } catch (err) {
        res.status(500).json({ message: "Yetki oluşturulurken bir hata oluştu." });
    }
});

// Yetki güncelle
router.put("/:id", authMiddleware, checkPermission("permission_update"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key, description } = req.body;

        const permission = await Permissions.findById(id);
        if (!permission) {
            return res.status(404).json({ message: "Yetki bulunamadı." });
        }

        if (key && key !== permission.key) {
            const existingPermission = await Permissions.findOne({ key });
            if (existingPermission) {
                return res.status(400).json({ message: "Bu yetki anahtarı zaten kullanımda." });
            }
            permission.key = key;
        }

        if (name) permission.name = name;
        if (description) permission.description = description;

        await permission.save();
        res.json(permission);
    } catch (err) {
        res.status(500).json({ message: "Yetki güncellenirken bir hata oluştu." });
    }
});

// Yetki sil
router.delete("/:id", authMiddleware, checkPermission("permission_delete"), async (req, res) => {
    try {
        const { id } = req.params;
        const permission = await Permissions.findByIdAndDelete(id);

        if (!permission) {
            return res.status(404).json({ message: "Yetki bulunamadı." });
        }

        res.json({ message: "Yetki başarıyla silindi." });
    } catch (err) {
        res.status(500).json({ message: "Yetki silinirken bir hata oluştu." });
    }
});

// Bir role, permission key ile yetki ekle
router.post("/assign-to-role", authMiddleware, async (req, res) => {
    try {
        const { roleId, permissionKeys } = req.body;
        if (!roleId || !Array.isArray(permissionKeys) || permissionKeys.length === 0) {
            return res.status(400).json({ message: "roleId ve permissionKeys (array) gereklidir." });
        }
        const Roles = (await import("../db/models/roles.js")).default;
        const role = await Roles.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: "Rol bulunamadı." });
        }
        const permissions = await Permissions.find({ key: { $in: permissionKeys } });
        if (permissions.length !== permissionKeys.length) {
            return res.status(400).json({ message: "Bazı permission key'leri bulunamadı.", found: permissions.map(p => p.key) });
        }
        // Sadece yeni eklenenleri ekle
        const newPermissionIds = permissions.map(p => p._id).filter(id => !role.permissions.includes(id));
        role.permissions.push(...newPermissionIds);
        await role.save();
        const populatedRole = await Roles.findById(role._id).populate("permissions");
        res.json(populatedRole);
    } catch (err) {
        res.status(500).json({ message: "Yetki eklenirken bir hata oluştu.", error: err.message });
    }
});

export default router;