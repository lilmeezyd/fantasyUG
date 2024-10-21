import express from "express";
import {
  updateMDdata,
  endMatchday,
  setMatchday,
  getMatchdays,
  getMatchday,
  updateMatchday,
  deleteMatchday,
  startMatchday,
  updateTOW,
  getTOW,
  getTOWs,
  getMaxMD,
} from "../controllers/matchdayController.js";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
const router = express.Router();

router
  .route("/")
  .get(getMatchdays)
  .post(protect, roles(ROLES.ADMIN), setMatchday);
router
  .route("/:id")
  .get(getMatchday)
  .patch(protect, roles(ROLES.ADMIN), startMatchday)
  .patch(protect, roles(ROLES.ADMIN, ROLES.EDITOR), updateMatchday)
  .delete(protect, roles(ROLES.ADMIN), deleteMatchday);

router.route("/data/max").get(getMaxMD);
router.route("/data/tows").get(getTOWs);
router.route("/data/tows/:id").get(getTOW);

router
  .route("/updateTOW/:id")
  .get(getTOW)
  .put(protect, roles(ROLES.ADMIN), updateTOW);

router
  .route("/endmatchday/:id")
  .patch(protect, roles(ROLES.ADMIN), endMatchday);
router
  .route("/updateMdData/:id")
  .patch(protect, roles(ROLES.ADMIN), updateMDdata);

export default router;
