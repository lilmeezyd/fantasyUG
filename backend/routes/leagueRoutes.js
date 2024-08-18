import express from "express";
import {
  setLeague,
  setOverallLeague,
  setTeamLeague,
  getLeagues,
  getLeague,
  getOverallLeague,
  getTeamLeague,
  editLeague,
  editOverallLeague,
  editTeamLeague,
  deleteLeague,
  deleteTeamLeague,
  deleteOverallLeague,
  addToLeague,
  getTeamLeagues,
  getOverallLeagues,
} from "../controllers/leagueController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router
  .route("/overallleagues")
  .post(protect, roles(ROLES.ADMIN), setOverallLeague);
router.route("/teamleagues").post(protect, roles(ROLES.ADMIN), setTeamLeague);
router
  .route("/privateleagues")
  .post(protect, roles(ROLES.NORMAL_USER, ROLES.ADMIN), setLeague);
router.route("/teamleagues").get(getTeamLeagues);
router.route("/overallleagues").get(getOverallLeagues);
router.route("/privateleagues").get(getLeagues);
router
  .route("/overallleagues/:id")
  .get(getOverallLeague)
  .patch(protect, roles(ROLES.ADMIN), editOverallLeague)
  .delete(protect, roles(ROLES.ADMIN), deleteOverallLeague);
router
  .route("/teamleagues/:id")
  .get(getTeamLeague)
  .patch(protect, roles(ROLES.ADMIN), editTeamLeague)
  .delete(protect, roles(ROLES.ADMIN), deleteTeamLeague);
router
  .route("/privateleagues/:id")
  .get(getLeague)
  .patch(protect, roles(ROLES.NORMAL_USER, ROLES.ADMIN), editLeague)
  .delete(protect, roles(ROLES.NORMAL_USER, ROLES.ADMIN), deleteLeague);

export default router;
