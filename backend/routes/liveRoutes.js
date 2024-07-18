import express from "express";
import {
  getLivePicks,
  getRound,
  setLivePicks,
  setInitialPoints,
  addPointsToPicks, 
  deletePoints,
} from "../controllers/managerLiveController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router.route("/").put(setLivePicks);
router
  .route("/matchday/:mid/fixtures/:id")
  .put(protect, roles(ROLES.ADMIN), deletePoints);
router
  .route("/matchday/:mid/start/fixtures/:id")
  .put(protect, roles(ROLES.ADMIN), setInitialPoints);
router.route("/:id").get(protect, getLivePicks);
router.route("/:id/matchday/:mid").get(protect, getRound);
router
  .route("/matchday/:mid/player/:pid")
  .put(protect, roles(ROLES.ADMIN), addPointsToPicks);

export default router
