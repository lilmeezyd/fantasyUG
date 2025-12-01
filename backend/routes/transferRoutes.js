import express from "express";
import {
  getTransfers, getTransferDetails
} from "../controllers/transferController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";

const router = express.Router();
router.route("/next-md-details").get( getTransferDetails)
router.route("/:id").get(protect, getTransfers)

export default router