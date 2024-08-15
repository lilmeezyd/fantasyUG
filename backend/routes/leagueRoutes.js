import express from "express";
import {
  setLeague,
  setOverallLeague,
  setTeamLeague,
  getLeagues,
  getLeague,
  editLeague,
  deleteLeague, 
  addToLeague,
  getTeamLeagues,
  getOverallLeague, 
} from "../controllers/leagueController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router.route("/overallleagues", protect, roles(ROLES.ADMIN))
router.route("/teamleagues", protect, roles(ROLES.ADMIN))
router.route("/privateleagues").post(protect, roles(ROLES.NORMAL_USER, ROLES.ADMIN), setLeague);
router.route('/teams').get(getTeamLeagues)
router.route('/overall').get(getOverallLeague)
router
  .route("/:id")
  .put(protect, roles(ROLES.NORMAL_USER), addToLeague)
  .delete(protect, deleteLeague);
router.route("/users/:id").get(protect, getLeagues);
router.route("/:id").get(protect, getLeague);

export default router;
