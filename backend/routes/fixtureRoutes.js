import express from "express";
import {
  setFixture,
  getFixtures,
  editFixture,
  populateStats,
  editStats,
  deleteFixture,
  updateScore,
  getFixture,
} from "../controllers/fixtureController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router
  .route("/")
  .get(getFixtures)
  .post(protect, roles(ROLES.ADMIN), setFixture);
router
  .route("/:id/populate")
  .put(protect, roles(ROLES.ADMIN, ROLES.EDITOR), populateStats);
router
  .route("/:id/stats")
  .put(protect, roles(ROLES.ADMIN, ROLES.EDITOR), editStats);
router
  .route("/:id/scores")
  .put(protect, roles(ROLES.ADMIN, ROLES.EDITOR), updateScore);
router
  .route("/:id")
  .get(getFixture)
  .put(protect, roles(ROLES.ADMIN, ROLES.EDITOR), editFixture)
  .delete(protect, roles(ROLES.ADMIN), deleteFixture);

export default router;
