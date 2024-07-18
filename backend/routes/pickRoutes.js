import express from "express";
import {
  setPicks,
  getPicks,
  updatePicks,
  previousPicks,
} from "../controllers/picksController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

/*
router.route('/:uid/matchday/:mid/picks')
      .get(previousPicks) 
router.route('/')
router.route('/:uid/matchday/:mid/picks/me')
      .get(protect, getPicks)
      .put(protect, updatePicks)
      .post(protect, setPicks)*/
router
  .route("/")
  .get(protect, roles(ROLES.NORMAL_USER), getPicks)
  .post(protect, roles(ROLES.NORMAL_USER), setPicks);
router.route("/:id").put(protect, roles(ROLES.NORMAL_USER), updatePicks);
export default router;
