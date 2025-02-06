import asyncHandler from "express-async-handler";
import Picks from "../models/picksModel.js";
import User from "../models/userModel.js";
import Matchday from "../models/matchdayModel.js";
import ManagerInfo from "../models/managerInfoModel.js";
import { joinOverallLeague } from "./leagueController.js";
import { joinTeamLeague } from "./leagueController.js";
import { updateHasPicks } from "./userController.js";
import { playerIncrement } from "./playerController.js";

//@desc Set Pickss
//@route POST /api/picks/ 
//@access Private
const setPicks = asyncHandler(async (req, res) => {
  const { picks, teamName, bank, teamValue, playerLeague, overallLeague } = req.body;
  const user = await User.findById(req.user.id);
  const userHasPicks = await Picks.find({ user: req.user.id });
  const mgrExists = await ManagerInfo.findOne({ user: req.user.id });
  const nextMD = await Matchday.findOne({next: true})
  const { id } = nextMD

  const goalkeepers = picks?.filter(
    (pick) => pick?.playerPosition === "669a41e50f8891d8e0b4eb2a"
  ).length;
  const defenders = picks?.filter(
    (pick) => pick?.playerPosition === "669a4831e181cb2ed40c240f"
  ).length;
  const midfielders = picks?.filter(
    (pick) => pick?.playerPosition === "669a4846e181cb2ed40c2413"
  ).length;
  const forwards = picks?.filter(
    (pick) => pick?.playerPosition === "669a485de181cb2ed40c2417"
  ).length;
  if (!picks) {
    res.status(400);
    throw new Error("No players added");
  }
  if (picks.length < 15 || picks.length > 15) {
    res.status(400);
    throw new Error("15 players should be picked");
  }

  if(goalkeepers !== 2) {
    res.status(400)
    throw new Error('2 goalkeepers should be selected')
  }
  if(defenders !== 5) {
    res.status(400)
    throw new Error('5 defenders should be selected')
  }
  if(midfielders !== 5) {
    res.status(400)
    throw new Error('5 midfielders should be selected')
  }
  if(forwards !== 3) {
    res.status(400)
    throw new Error('3 forwards should be selected')
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
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    matchdayJoined: id,
    teamName,
  });

  if(managerInfo) {
  const matchdayPicks = await Picks.create({
    picks,
    teamValue,
    bank,
    manager: managerInfo._id,
  });
  if(matchdayPicks) {
    picks.forEach(async (pick) => {
      playerIncrement(pick._id, 1)
    })
    joinOverallLeague(req.user, managerInfo._id, overallLeague)
    joinTeamLeague(req.user, managerInfo._id, playerLeague)
    const hasPicks = await updateHasPicks(req.user.id)
    res.status(200).json({matchdayPicks, managerInfo, hasPicks});
  }
  }

});

//@desc Get picks
//@route GET /api/picks/:id
//@access Private
const getPicks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const userManager = await ManagerInfo.findOne({
    $or: [{ user: req.params.id }, { _id: req.params.id }],
  });

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if(userManager) {
    const { _id } = userManager
    const managerPicks = await Picks.findOne({ manager: _id })
    res.status(200).json(managerPicks);
  }
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
  const userManager = await ManagerInfo.findOne({user: req.user.id});
  const { picks, teamValue, bank, transfersOut, transfersIn } = req.body;
  //Check for user
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if(playerPicks.manager.toString() !== userManager._id.toString()) {
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

  if(updatedPicks && transfersOut && transfersIn) {
    const inIds = transfersIn.map(x => x._id)
    const outIds = transfersOut.map(x => x._id)
    inIds.forEach(async (pick) => {
      playerIncrement(pick, 1)
    })
    outIds.forEach(async (pick) => {
      playerIncrement(pick, -1)
    })
  }
  res.status(200).json(updatedPicks);
});

export { setPicks, getPicks, getMatchdayPicks, updatePicks, previousPicks };
