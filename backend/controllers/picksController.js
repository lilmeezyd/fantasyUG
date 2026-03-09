import asyncHandler from "express-async-handler";
import Picks from "../models/picksModel.js";
import User from "../models/userModel.js";
import Matchday from "../models/matchdayModel.js";
import ManagerInfo from "../models/managerInfoModel.js";
import OverallLeague from "../models/overallLeagueModel.js";
import TeamLeague from "../models/teamLeagueModel.js";
import League from "../models/leagueModel.js";
import TransfersModel from "../models/transfersModel.js";
import Player from "../models/playerModel.js";
import { joinOverallLeague } from "./leagueController.js";
import { joinTeamLeague } from "./leagueController.js";
import { updateHasPicks } from "./userController.js";
import { playerIncrement } from "./playerController.js";
import mongoose from "mongoose";

//@desc Set Pickss
//@route POST /api/picks/
//@access Private
const setPicks = asyncHandler(async (req, res) => {
  const { picks, teamName, bank, teamValue, playerLeague } = req.body;

  if (!Array.isArray(picks) || picks.length !== 15)
    throw new Error("Exactly 15 players required");

  if (!teamValue || isNaN(bank)) throw new Error("Missing fields");
  if (bank < 0) throw new Error("Not enough funds");

  const posCounts = picks.reduce((acc, p) => {
    acc[p.playerPosition] = (acc[p.playerPosition] || 0) + 1;
    return acc;
  }, {});
  if (posCounts[1] !== 2) throw new Error("2 goalkeepers required");
  if (posCounts[2] !== 5) throw new Error("5 defenders required");
  if (posCounts[3] !== 5) throw new Error("5 midfielders required");
  if (posCounts[4] !== 3) throw new Error("3 forwards required");

  const [
    overallLeague,
    teamLeague,
    user,
    existing,
    mgrExists,
    allMatchdays,
    nextMD,
  ] = await Promise.all([
    League.findOne({ leagueType: "Overall", name: "Overall" }),
    TeamLeague.findById(playerLeague),
    User.findById(req.user.id),
    Picks.findOne({ user: req.user.id }),
    ManagerInfo.findOne({ user: req.user.id }),
    Matchday.find({}).lean(),
    Matchday.findOne({ next: true }),
  ]);

  if (!user) throw new Error("User not found");

  if (existing) throw new Error("User has already made picks");

  if (mgrExists) throw new Error("Manager info already exists");
  if (!overallLeague) throw new Error("Overall leagues not found");
  if (!teamLeague) throw new Error("Team league not found");

  const maxMD = Math.max(...allMatchdays.map((x) => x.id));
  const matchdayId = nextMD ? nextMD.id : maxMD + 1;

  const overallLeagueId = overallLeague._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const createdManager = await ManagerInfo.create(
      [
        {
          user: req.user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          matchdayJoined: matchdayId,
          teamName,
          teamLeagues: playerLeague,
          overallLeagues: overallLeagueId,
        },
      ],
      { session },
    );

    //if (!createdManager) throw new Error("Manager creation failed");

    const createdPicks = await Picks.create(
      [
        {
          picks,
          teamValue,
          bank,
          manager: createdManager[0]._id,
        },
      ],
      { session },
    );

    const [ joinOverall, joinTeam, hasPicks] = await Promise.all([
      joinOverallLeague(
        req.user,
        createdManager[0]._id,
        overallLeague._id,
        session,
      ),
      joinTeamLeague(req.user, createdManager[0]._id, playerLeague, session),
      User.findByIdAndUpdate(
        req.user.id,
        { hasPicks: true },
        { new: true, session },
      ),
    ]);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      managerInfo: createdManager[0],
      matchdayPicks: createdPicks[0],
      hasPicks,
      message: "Team saved",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ message: "Operation failed, try again", details: error.message });
    /*if (createdPicks) {
      await Picks.deleteOne({ manager: createdManager._id });
    }

    if (createdManager) {
      await ManagerInfo.deleteOne({ _id: createdManager._id });
    }

    if (ownershipIncrements.length) {
      for (const id of ownershipIncrements) {
        await Player.updateOne({ _id: id }, { $inc: { playerCount: -1 } });
      }
    }

    if (overallJoin) {
      await OverallLeague.findByIdAndUpdate(overallLeague, {
        $pull: { entrants: createdManager._id },
      });
    }
    if (teamJoin) {
      await TeamLeague.findByIdAndUpdate(playerLeague, {
        $pull: { entrants: createdManager._id },
      });
    }

    await User.updateOne({ _id: req.user.id }, { hasPicks: false });

    res.status(500).json({
      message: "Operation failed, Try again",
      details: error.message,
    });*/
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
    const { _id } = userManager;
    const managerPicks = await Picks.findOne({ manager: _id });
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
  const { picks, teamValue, bank, transfersOut, transfersIn } = req.body;

  const [playerPicks, user, matchday, userManager] = await Promise.all([
    Picks.findById(req.params.id),
    User.findById(req.user.id),
    Matchday.findOne({ next: true }),
    ManagerInfo.findOne({ user: req.user.id }),
  ]);

  if (!user) throw new Error("User not found");
  if (!playerPicks) throw new Error("Picks not found");
  if (!userManager) throw new Error("Manager profile not found");
  if (!matchday) throw new Error("No more matchdays left");

  if (playerPicks.manager.toString() !== userManager._id.toString())
    throw new Error("Unauthorized access");

  if (!Array.isArray(playerPicks.picks) || playerPicks.picks.length !== 15)
    throw new Error("Existing picks corrupted");

  if (!Array.isArray(picks) || picks.length !== 15)
    throw new Error("Exactly 15 players should be picked");

  if (typeof teamValue !== "number" || typeof bank !== "number")
    throw new Error("Team value and bank must be numeric");

  if (bank < 0) throw new Error("Not enough funds");

  const updatedPicks = await Picks.findByIdAndUpdate(
    req.params.id,
    { picks, teamValue, bank },
    { new: true },
  );

  if (
    Array.isArray(transfersIn) &&
    Array.isArray(transfersOut) &&
    transfersIn.length &&
    transfersOut.length &&
    updatedPicks
  ) {
    const inMap = new Map(transfersIn.map((x) => [x.slot, x]));
    const outMap = new Map(transfersOut.map((x) => [x.slot, x]));
    const inIds = transfersIn.map((x) => x._id);
    const outIds = transfersOut.map((x) => x._id);

    const transfers = transfersIn.map((x) => ({
      transferIn: { ...inMap.get(x.slot) },
      transferOut: { ...outMap.get(x.slot) },
      matchday: matchday?._id,
      manager: userManager._id,
      user: req.user.id,
    }));

    userManager.matchdayJoined < matchday.id &&
      (await Promise.allSettled([
        ...transfers.map((t) => TransfersModel.create(t)),
      ]));

    // Handle all async work safely
    await Promise.allSettled([
      ...inIds.map((id) => playerIncrement(id, 1, req, res)),
      ...outIds.map((id) => playerIncrement(id, -1, req, res)),
    ]);
  }

  return res.status(200).json({
    success: true,
    message: "Changes saved",
  });
});

export { setPicks, getPicks, getMatchdayPicks, updatePicks, previousPicks };
