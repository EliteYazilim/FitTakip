import Users from "../db/models/usersModel.js";
import Roles from "../db/models/roles.js";
import Permissions from "../db/models/permissions.js";
import Enum from "../config/enum.js";

const checkPermission = (permissionKey) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Yetkilendirme gerekli." });
            }

            const user = await Users.findById(req.user.id).populate({
                path: 'role',
                populate: {
                    path: 'permissions'
                }
            });

            if (!user || !user.role) {
                return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
            }

            const hasPermission = user.role.permissions.some(permission => permission.key === permissionKey);
            if (!hasPermission) {
                return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
            }

            next();
        } catch (err) {
            res.status(500).json({ message: "Yetki kontrolü sırasında bir hata oluştu." });
        }
    };
};

export default checkPermission;
