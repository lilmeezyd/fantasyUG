import express from "express";
import {
  setLeague,
  setOverallLeague,
  setTeamLeague,
  getLeague,
  getTeamLeague,
  editLeague,
  editTeamLeague,
  deleteLeague,
  deleteTeamLeague,
  joinOverallLeague,
  joinTeamLeague,
  joinPrivateLeague,
  getTeamLeagues,
  getOverallLeagues,
  getPrivateLeagues,
  setCurrentAndLastRanks,
  getOverallStandings,
  getWeeklyStandings,
  updateOverallTable,
  updatePrivateTables,
  updateTeamTables
} from "../controllers/leagueController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router.route("/leagues/setLastAndNow")
.put(protect, roles(ROLES.ADMIN), setCurrentAndLastRanks)

router
  .route("/")
  .post(protect, setLeague);
  router
  .route("/overallleagues")
  .get(getOverallLeagues)
router
  .route("/teamleagues")
  .get(getTeamLeagues)
router
  .route("/privateleagues")
  .get(getPrivateLeagues)

  router
  .route("/teamleagues")
  .patch(protect, roles(ROLES.ADMIN), updateTeamTables);
router
  .route("/overallleagues")
  .patch(protect, roles(ROLES.ADMIN), updateOverallTable);
router
  .route("/privateleagues")
  .patch(protect, roles(ROLES.ADMIN), updatePrivateTables);
  router
  .route("/:id")
  .get(getLeague)
  .patch(protect, roles(ROLES.ADMIN), editLeague)
  .delete(protect, roles(ROLES.ADMIN), deleteLeague);
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
router
  .route("/overallleagues/:id/join")
  .patch(protect, roles(ROLES.NORMAL_USER), joinOverallLeague);
router
  .route("/teamleagues/:id/join")
  .patch(protect, roles(ROLES.NORMAL_USER), joinTeamLeague);
router
  .route("/privateleagues/:id/join")
  .patch(protect, roles(ROLES.NORMAL_USER), joinPrivateLeague);
router.route("/:id/standings").get(protect, getOverallStandings)
router.route("/:id/standings/matchday/:mid").get(protect, getWeeklyStandings)

export default router;
