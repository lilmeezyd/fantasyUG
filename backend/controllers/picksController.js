import asyncHandler from "express-async-handler";
import Picks from "../models/picksModel.js";
import User from "../models/userModel.js";
import Matchday from "../models/matchdayModel.js";
import ManagerInfo from "../models/managerInfoModel.js";

//@desc Set Pickss
//@route POST /api/picks/ 
//@access Private
const setPicks = asyncHandler(async (req, res) => {
  const { picks, teamName, bank, teamValue } = req.body;
  const user = await User.findById(req.user.id);
  const userHasPicks = await Picks.find({ user: req.user.id });
  const mgrExists = await ManagerInfo.findOne({ user: req.user.id });
  if (!picks) {
    res.status(400);
    throw new Error("No players added");
  }
  if (picks.length < 15 || picks.length > 15) {
    res.status(400);
    throw new Error("15 players should be picked");
  }

  //Check if user already has a team
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  if (userHasPicks.length > 0) {
    res.status(400);
    throw new Error("User has already made picks");
  }

  if (mgrExists) {
    res.status(400);
    throw new Error("Manager Info already created");
  } 

  if(!teamValue || isNaN(bank)) {
    res.status(400)
    throw new Error('Please add all fields')
  }


  if (bank < 0) {
    res.status(400);
    throw new Error("Not enough funds");
  }


  const managerInfo = await ManagerInfo.create({
    user: req.user.id,
    teamName,
  });

  const matchdayPicks = await Picks.create({
    picks,
    teamValue,
    bank,
    user: req.user.id,
  });


  res.status(200).json({matchdayPicks, managerInfo});
});

//@desc Get picks
//@route GET /api/picks
//@access Private
const getPicks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const managerPicks = await Picks.findOne({ user: req.user.id });

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  res.status(200).json(managerPicks);
});

//@desc Get Matchday Picks
//@route GET /api/user/:uid/matchday/:mid/picks/me
//@access Private
const getMatchdayPicks = asyncHandler(async (req, res) => {
  const picks = await Picks.find({
    user: req.params.uid,
    matchday: req.params.mid,
  });
  const user = await User.findById(req.user.id);
  const matchday = await Matchday.findById(req.params.mid);

  //Check for picks
  if (!picks) {
    res.status(400);
    throw new Error("Picks not found");
  }

  //Check for matchday
  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  }
  //Check if it's past deadline
  if (!(validDeadline.deadlineTime >= new Date().toISOString())) {
    res.status(400);
    throw new Error(`Deadline for ${validDeadline.name} has already passed`);
  }

  //Check for user
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  //Check if logged in user matches the user
  if (picks.user.toString() !== user.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  res.status(200).json(picks);
});

//@desc Get Picks from previous rounds
//@route GET /api/user/:uid/matchday/:mid/picks
//@access Public
const previousPicks = asyncHandler(async (req, res) => {
  const picks = await Picks.find({ user: req.params.uid });
  const validDeadline = await Matchday.findById(req.params.mid);
  const user = await User.findById(uid);
  //Check if matchdays are previous
  if (validDeadline.deadlineTime > new Date().toISOString()) {
    res.status(401);
    throw new Error(`Not authorized to view picks before deadline`);
  }
  //Check requested user is valid
  if (!user) {
    res.status(400);
    throw new Error(`Requested user doesn't exist`);
  }
  //Check if requested matchday is valid
  if (!validDeadline) {
    res.status(400);
    throw new Error(`Requested matchday doesn't exist`);
  }
  res.status(200).json(picks);
});

//@desc Update Picks before deadline
//@route PATCh /api/picks/:id
//@access Private
const updatePicks = asyncHandler(async (req, res) => {
  const playerPicks = await Picks.findById(req.params.id);
  const user = await User.findById(req.user.id);
  const { picks, teamValue, bank } = req.body;

  //Check for user
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if(playerPicks.user.toString() !== req.user.id.toString()) {
    res.status(401)
    throw new Error('Unathorized access')
  }

  //Check for Player Picks
  if (!playerPicks) {
    res.status(400);
    throw new Error("Picks not found");
  }

  if (playerPicks.length < 15) {
    res.status(400);
    throw new Error("Something wrong");
  }

  if (picks.length < 15 || picks.length > 15) {
    res.status(400);
    throw new Error("15 players should be picked");
  }

  if(!teamValue || isNaN(bank)) {
    res.status(400)
    throw new Error('Please add all fields')
  }


  if (bank < 0) {
    res.status(400);
    throw new Error("Not enough funds");
  }

  
  const updatedPicks = await Picks.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json(updatedPicks);
});

export { setPicks, getPicks, getMatchdayPicks, updatePicks, previousPicks };
