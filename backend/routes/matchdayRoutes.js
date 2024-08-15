import express from "express";
import {
  setMatchday,
  getMatchdays,
  getMatchday,
  updateMatchday,
  deleteMatchday,
} from "../controllers/matchdayController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router
  .route("/")
  .get(getMatchdays)
  .post(protect, roles(ROLES.ADMIN), setMatchday);
router
  .route("/:id")
  .get(getMatchday)
  .patch(protect, roles(ROLES.ADMIN, ROLES.EDITOR), updateMatchday)
  .delete(protect, roles(ROLES.ADMIN), deleteMatchday);

export default router;
