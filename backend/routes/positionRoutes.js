import express from "express";
import {
  getPositions,
  setPosition,
  updatePosition,
  getPosition,
  deletePosition,
} from "../controllers/positionController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router
  .route("/")
  .get(getPositions)
  .post(protect, roles(ROLES.ADMIN), setPosition);
router
  .route("/:id")
  .get(getPosition)
  .patch(protect, roles(ROLES.EDITOR, ROLES.ADMIN), updatePosition)
  .delete(protect, roles(ROLES.ADMIN), deletePosition);

export default router;
