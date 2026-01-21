import express from "express";
import {
  getPlayers,
  getPlayer,
  getPlayersByFixture,
  getPlayerHistory,
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
  .patch(protect, roles(ROLES.ADMIN, ROLES.EDITOR), updatePlayer)
  .delete(protect, roles(ROLES.ADMIN), deletePlayer);
router.route("/:id/history").get(getPlayerHistory);
router.route("/fixture/:id").get(getPlayersByFixture)

export default router;
