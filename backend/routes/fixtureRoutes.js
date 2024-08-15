import express from "express";
import {
  setFixture,
  getFixtures,
  editFixture,
  populateStats,
  dePopulateStats,
  editStats,
  deleteFixture,
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
  .patch(protect, roles(ROLES.ADMIN, ROLES.EDITOR), populateStats);
router
  .route("/:id/depopulate")
  .patch(protect, roles(ROLES.ADMIN, ROLES.EDITOR), dePopulateStats);
router
  .route("/:id/stats")
  .patch(protect, roles(ROLES.ADMIN, ROLES.EDITOR), editStats);
router
  .route("/:id")
  .get(getFixture)
  .patch(protect, roles(ROLES.ADMIN, ROLES.EDITOR), editFixture)
  .delete(protect, roles(ROLES.ADMIN), deleteFixture);

export default router;
