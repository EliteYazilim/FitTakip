import express from "express";
import Roles from "../db/models/roles.js";
import Permissions from "../db/models/permissions.js";
import Enum from "../config/enum.js";
import authMiddleware from "../middleware/authMiddleware.js";
import checkPermission from "../middleware/checkpermission.js";

const router = express.Router();

// Tüm rolleri listele
router.get("/", authMiddleware, checkPermission("role_view"), async (req, res) => {
    try {
        const roles = await Roles.find().populate("permissions");
        res.json(roles);
    } catch (err) {
        console.error("Rol listeleme hatası:", err);
        res.status(500).json({ message: "Roller listelenirken bir hata oluştu.", error: err.message });
    }
});

// Yeni rol oluştur
router.post("/", authMiddleware, checkPermission("role_add"), async (req, res) => {
    try {
        const { name, permissions } = req.body;
        
        if (!name || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({ 
                message: "Geçersiz istek formatı.",
                details: "name ve permissions (array) alanları gereklidir."
            });
        }

        // Rol adı kontrolü
        const existingRole = await Roles.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: "Bu rol adı zaten kullanımda." });
        }

        // Yetkilerin varlığını kontrol et
        const validPermissions = await Permissions.find({ _id: { $in: permissions } });
        if (validPermissions.length !== permissions.length) {
            return res.status(400).json({ 
                message: "Geçersiz yetki ID'leri.",
                details: `Gönderilen ${permissions.length} yetkiden ${validPermissions.length} tanesi bulundu.`
            });
        }

        const role = new Roles({ name, permissions });
        await role.save();
        
        // Oluşturulan rolü yetkileriyle birlikte döndür
        const populatedRole = await Roles.findById(role._id).populate("permissions");
        res.status(201).json(populatedRole);
    } catch (err) {
        console.error("Rol oluşturma hatası:", err);
        res.status(500).json({ 
            message: "Rol oluşturulurken bir hata oluştu.",
            error: err.message
        });
    }
});

// Rol güncelle
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;

        // Rolün varlığını kontrol et
        const role = await Roles.findById(id);
        if (!role) {
            return res.status(404).json({ message: "Rol bulunamadı." });
        }

        // Yetkilerin varlığını kontrol et
        if (permissions) {
            if (!Array.isArray(permissions)) {
                return res.status(400).json({ message: "permissions bir dizi olmalıdır." });
            }

            const validPermissions = await Permissions.find({ _id: { $in: permissions } });
            if (validPermissions.length !== permissions.length) {
                return res.status(400).json({ 
                    message: "Geçersiz yetki ID'leri.",
                    details: `Gönderilen ${permissions.length} yetkiden ${validPermissions.length} tanesi bulundu.`
                });
            }
            role.permissions = permissions;
        }

        if (name) role.name = name;
        await role.save();

        // Güncellenmiş rolü yetkileriyle birlikte döndür
        const updatedRole = await Roles.findById(role._id).populate("permissions");
        res.json(updatedRole);
    } catch (err) {
        console.error("Rol güncelleme hatası:", err);
        res.status(500).json({ 
            message: "Rol güncellenirken bir hata oluştu.",
            error: err.message
        });
    }
});

// Rol sil
router.delete("/:id", authMiddleware, checkPermission("role_delete"), async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Roles.findByIdAndDelete(id);
        
        if (!role) {
            return res.status(404).json({ message: "Rol bulunamadı." });
        }

        res.json({ message: "Rol başarıyla silindi." });
    } catch (err) {
        console.error("Rol silme hatası:", err);
        res.status(500).json({ 
            message: "Rol silinirken bir hata oluştu.",
            error: err.message
        });
    }
});

export default router;
