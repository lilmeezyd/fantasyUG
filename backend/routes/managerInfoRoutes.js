import express from "express";
import { getManagerInfo } from "../controllers/managerInfoController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router.route("/").get(protect, roles(ROLES.NORMAL_USER), getManagerInfo);

export default router;
