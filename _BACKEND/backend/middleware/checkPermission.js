import Users from "../db/models/usersModel.js";
import roles from "../db/models/roles.js";
import permissions from "../db/models/permissions.js";
import Enum from "../config/enum.js";

const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Authentication required" });
    }

    const userWithPermissions = await Users.findOne({
      _id: req.user.id
    }).populate({
      path: 'role',
      populate: {
        path: 'permissions'
      }
    });

    if (!userWithPermissions?.role?.permissions?.some(p => p.key === permissionKey)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

export default checkPermission;
