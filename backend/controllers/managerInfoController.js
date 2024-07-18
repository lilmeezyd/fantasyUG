import asyncHandler from "express-async-handler";
import ManagerInfo from "../models/managerInfoModel.js";
import User from "../models/userModel.js";

//@desc Get manager info
//@route GET /api/managerinfo/
//@access Private
const getManagerInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const managerInfo = await ManagerInfo.findOne({ user: req.user.id });
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  res.status(200).json(managerInfo);
});

export { getManagerInfo };
