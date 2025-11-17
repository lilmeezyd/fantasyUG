import express from "express";
import {
  getTransfers,
} from "../controllers/transferController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";

const router = express.Router();
router.route("/:id").get(protect, getTransfers)

export default router