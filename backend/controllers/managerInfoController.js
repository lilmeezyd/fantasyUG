import asyncHandler from "express-async-handler";
import ManagerInfo from "../models/managerInfoModel.js";
import User from "../models/userModel.js";

//@desc Get manager info
//@route GET /api/managerinfo/:id
//@access Private
const getManagerInfo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const managerInfo = await ManagerInfo.findOne({
    $or: [{ user: req.params.id }, { _id: req.params.id }],
  });
  console.log(managerInfo)
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  res.status(200).json(managerInfo);
});

export { getManagerInfo }; 
