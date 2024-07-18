import express from "express";
import {
  getPlayers,
  getPlayer,
  setPlayer,
  updatePlayer,
  deletePlayer,
} from "../controllers/playerController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router.route("/").get(getPlayers).post(protect, roles(ROLES.ADMIN), setPlayer);

router
  .route("/:id")
  .get(getPlayer)
  .put(protect, roles(ROLES.ADMIN, ROLES.EDITOR), updatePlayer)
  .delete(protect, roles(ROLES.ADMIN), deletePlayer);

export default router;
