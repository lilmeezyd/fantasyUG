import express from "express";
import {
  getTeams,
  setTeams,
  updateTeam,
  deleteTeam,
} from "../controllers/teamController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router.route("/").get(getTeams).post(protect, roles(ROLES.ADMIN), setTeams);
router
  .route("/:id")
  .put(protect, roles(ROLES.EDITOR, ROLES.ADMIN), updateTeam)
  .delete(protect, roles(ROLES.ADMIN), deleteTeam);

export default router;
