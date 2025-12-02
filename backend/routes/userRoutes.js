import express from "express";
import { protect, roles } from "../middleware/authMiddleware.js";
import ROLES from "../config/permissions.js";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getTotalManagers,
  getProfile
} from "../controllers/userController.js";
const router = express.Router();

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router.get("/all", protect, roles(ROLES.ADMIN), getAllUsers)
router.get("/totalManagers", protect, getTotalManagers)
router.get("/me", protect, getProfile);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
