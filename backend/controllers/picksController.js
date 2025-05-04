import asyncHandler from "express-async-handler";
import Picks from "../models/picksModel.js";
import User from "../models/userModel.js";
import Matchday from "../models/matchdayModel.js";
import ManagerInfo from "../models/managerInfoModel.js";
import OverallLeague from "../models/overallLeagueModel.js";
import TeamLeague from "../models/teamLeagueModel.js";
import { joinOverallLeague } from "./leagueController.js";
import { joinTeamLeague } from "./leagueController.js";
import { updateHasPicks } from "./userController.js";
import { playerIncrement } from "./playerController.js";
import mongoose from "mongoose";

//@desc Set Pickss
//@route POST /api/picks/ 
//@access Private
const setPicks = asyncHandler(async (req, res) => {
  const { picks, teamName, bank, teamValue, playerLeague, overallLeague } = req.body;
  const user = await User.findById(req.user.id);
  const userHasPicks = await Picks.find({ user: req.user.id });
  const mgrExists = await ManagerInfo.findOne({ user: req.user.id });
  const nextMD = await Matchday.findOne({ next: true })
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

  if (goalkeepers !== 2) {
    res.status(400)
    throw new Error('2 goalkeepers should be selected')
  }
  if (defenders !== 5) {
    res.status(400)
    throw new Error('5 defenders should be selected')
  }
  if (midfielders !== 5) {
    res.status(400)
    throw new Error('5 midfielders should be selected')
  }
  if (forwards !== 3) {
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

  if (!teamValue || isNaN(bank)) {
    res.status(400)
    throw new Error('Please add all fields')
  }


  if (bank < 0) {
    res.status(400);
    throw new Error("Not enough funds");
  }

  const requiredLeague = await OverallLeague.findById(overallLeague);
  const requiredTeamLeague = await TeamLeague.findById(playerLeague);
  const { creator: oCreator, name, id: oId, startMatchday: oSM, endMatchday: oEM } = requiredLeague;
  const { creator: tCreator, team, id: tId, startMatchday: tSM, endMatchday: tEM } = requiredTeamLeague;

  const newOverallLeague = {
    creator: oCreator,
    id: oId,
    name,
    startMatchday: oSM,
    endMatchday: oEM,
    lastRank: null,
    currentRank: null,
    matchdayPoints: 0,
    overallPoints: 0,
  };
  const newTeamLeague = {
    creator: tCreator,
    team,
    id: tId,
    startMatchday: tSM,
    endMatchday: tEM,
    lastRank: null,
    currentRank: null,
    matchdayPoints: 0,
    overallPoints: 0,
  };
  const session = await mongoose.startSession();
  session.startTransaction()


  try {
    const managerInfo = await ManagerInfo.create([{
      user: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      matchdayJoined: id,
      teamName,
      teamLeagues: newTeamLeague,
      overallLeagues: newOverallLeague,
    }], { session });

    if (!managerInfo || !managerInfo[0]) throw new Error("Manager creation failed")

    const matchdayPicks = await Picks.create([{
      picks,
      teamValue,
      bank,
      manager: managerInfo[0]._id,
    }], { session });
    if (!matchdayPicks || !matchdayPicks[0]) throw new Error("Picks creation failed");

    // Update player ownership counts
    await Promise.all(picks.map(pick => playerIncrement(pick._id, 1, session)));

    // Join leagues
    await joinOverallLeague(req.user, managerInfo[0]._id, overallLeague, session)
    await joinTeamLeague(req.user, managerInfo[0]._id, playerLeague, session)

    // Update flag
    const hasPicks = await updateHasPicks(req.user.id, session)

    await session.commitTransaction();
    session.endSession()
    res.status(200).json({ managerInfo: managerInfo[0], matchdayPicks: matchdayPicks[0], hasPicks });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error)
    res.status(500).json({ error: 'Something went wrong', details: err.message });
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

  if (userManager) {
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
  const userManager = await ManagerInfo.findOne({ user: req.user.id });
  const { picks, teamValue, bank, transfersOut, transfersIn } = req.body;
  //Check for user
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (playerPicks.manager.toString() !== userManager._id.toString()) {
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

  if (!teamValue || isNaN(bank)) {
    res.status(400)
    throw new Error('Please add all fields')
  }


  if (bank < 0) {
    res.status(400);
    throw new Error("Not enough funds");
  }
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const updatedPicks = await Picks.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }, {session});
    if(transfersIn && transfersOut) {
      if(!updatedPicks) throw new Error('Updating Picks failed');
      const inIds = transfersIn.map(x => x._id);
      const outIds = transfersOut.map(x => x._id);
      await Promise.all(inIds.map(id => playerIncrement(id, 1, session)))
      await Promise.all(outIds.map(id => playerIncrement(id, -1, session)))
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({msg: 'Changes saved'})
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error)
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }

});

export { setPicks, getPicks, getMatchdayPicks, updatePicks, previousPicks };
