import asyncHandler from "express-async-handler";
import Picks from "../models/picksModel.js";
import ManagerLive from "../models/managerLive.js";
import Player from "../models/playerModel.js";
import User from "../models/userModel.js";
import Matchday from "../models/matchdayModel.js";
import Fixture from "../models/fixtureModel.js";
import ManagerInfo from "../models/managerInfoModel.js";
import PlayerHistory from "../models/playerHistoryModel.js";
import OverallLeague from "../models/overallLeagueModel.js";
import TeamLeague from "../models/teamLeagueModel.js";
import League from "../models/leagueModel.js";
import mongoose from "mongoose";

//@desc set live picks
//@route PATCH api/livepicks/manager/
//@access   
const setLivePicks = asyncHandler(async (req, res) => {
  const allPicks = await Picks.find({});
  const matchday = await Matchday.findOne({ current: true });

  if (!matchday) {
    res.status(404);
    throw new Error("No matchday found!");
  }

  const matchdayNumber = matchday.id;
  const matchdayId = matchday._id;

  const createdManagers = [];
  const skippedManagers = [];

  for (const pick of allPicks) {
    const { manager, picks, teamValue, bank } = pick;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [mLive, mInfo] = await Promise.all([
        ManagerLive.findOne({ manager }).session(session),
        ManagerInfo.findById(manager).session(session),
      ]);

      // Skip if manager does not exist or joined after this matchday
      if (!mInfo || mInfo.matchdayJoined > matchdayNumber) {
        skippedManagers.push(manager);
        await session.abortTransaction();
        session.endSession();
        continue;
      }

      const newLivePick = {
        matchday: matchdayNumber,
        matchdayId,
        activeChip: null,
        picks,
        teamValue,
        bank,
      };

      await ManagerInfo.findByIdAndUpdate(
        manager,
        { matchdayPoints: 0 },
        { session }
      );

      if (!mLive) {
        await ManagerLive.create([{ manager, livePicks: [newLivePick] }], { session });
        createdManagers.push(manager);
      } else {
        const alreadyExists = mLive.livePicks.some(
          (x) =>
            x.matchday === matchdayNumber ||
            x.matchdayId.toString() === matchdayId.toString()
        );

        if (alreadyExists) {
          skippedManagers.push(manager);
        } else {
          await ManagerLive.updateOne(
            { manager },
            { $push: { livePicks: newLivePick } },
            { session }
          );
          createdManagers.push(manager);
        }
      }

      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(`Transaction failed for manager ${manager}:`, err);
      skippedManagers.push(manager);
    }
  }

  res.status(200).json({
    message: "Live picks processed successfully",
    createdManagers,
    skippedManagers,
  });
});



//@desc set initial points
//@route PATCH api/livepicks/manager/matchday/:mid/start/fixtures/:id
//@access ADMIN
const setInitialPoints = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id).lean();
  const matchday = await Matchday.findById(req.params.mid).lean();
  const players = await PlayerHistory.find({
    matchday: req.params.mid,
    fixture: req.params.id,
  }).lean();

  if (!fixture || !matchday || !matchday.current || !players.length) {
    return res.status(400).json({ message: "Invalid fixture, matchday, or no players" });
  }

  const allLives = await ManagerLive.find({ "livePicks.matchdayId": req.params.mid }).lean();
  /*
    if (mLive.length === 0) {
      res.status(400);
      throw new Error("No live Picks for this matchday");
    }*/
  // Build lookup maps
  const playerMap = {};
  for (const p of players) {
    if (!playerMap[p.player]) playerMap[p.player] = [];
    playerMap[p.player].push(p);
  }

  const liveUpdates = [];
  const infoUpdates = [];
  for (const mLive of allLives) {
    const mdPicks = mLive.livePicks.find(p => p.matchdayId.toString() === req.params.mid.toString());
    if (!mdPicks) continue;

    const formatted = mdPicks.picks.map(pick => {
      const stats = playerMap[pick._id] || [];
      if (stats.length > 0) {
        const starts = stats.reduce((a, b) => a + b.starts, 0);
        const bench = stats.reduce((a, b) => a + b.bench, 0);
        const totalPoints = stats.reduce((a, b) => a + b.totalPoints, 0);
        return {
          ...pick,
          starts,
          bench,
          points: pick.IsCaptain ? totalPoints * 2 : totalPoints,
        };
      } else {
        return pick;
      }
    });
    const newMdPoints = formatted.filter(p => p.multiplier > 0).reduce((a, b) => a + b.points, 0);
    const updatedLivePicks = mLive.livePicks.map(p =>
      p.matchdayId.toString() === req.params.mid ? { ...mdPicks, picks: formatted, matchdayPoints: newMdPoints } : p
    );
    liveUpdates.push({
      updateOne: {
        filter: { manager: mLive.manager },
        update: { $set: { livePicks: updatedLivePicks } },
      },
    });
    const managerInfo = await ManagerInfo.findById(mLive.manager).lean();
    if (!managerInfo) continue;

    const livePicks = updatedLivePicks;

    const calculatePoints = (startId, endId) => {
      return livePicks
        .filter(x => x.matchday >= startId && x.matchday <= (endId ?? 100))
        .reduce((sum, x) => sum + x.matchdayPoints, 0);
    };

    const teamStart = await Matchday.findById(managerInfo.teamLeagues[0].startMatchday).lean();
    const teamEnd = await Matchday.findById(managerInfo.teamLeagues[0].endMatchday).lean();
    const overallStart = await Matchday.findById(managerInfo.overallLeagues[0].startMatchday).lean();
    const overallEnd = await Matchday.findById(managerInfo.overallLeagues[0].endMatchday).lean();

    const teamPts = calculatePoints(teamStart?.id ?? 0, teamEnd?.id);
    const overallPts = calculatePoints(overallStart?.id ?? 0, overallEnd?.id);
    const totalPts = livePicks.reduce((a, b) => a + b.matchdayPoints, 0);
    infoUpdates.push({
      updateOne: {
        filter: { _id: mLive.manager },
        update: {
          $set: {
            matchdayPoints: newMdPoints,
            "teamLeagues.0.matchdayPoints": newMdPoints,
            "overallLeagues.0.matchdayPoints": newMdPoints,
            "teamLeagues.0.overallPoints": teamPts,
            "overallLeagues.0.overallPoints": overallPts,
            overallPoints: totalPts,
          },
        },
      },
    });
  }
  if (liveUpdates.length > 0) await ManagerLive.bulkWrite(liveUpdates);
  if (infoUpdates.length > 0) await ManagerInfo.bulkWrite(infoUpdates);

  res.status(200).json("Points updated successfully for all managers.");
});

//@desc update player scores in picks
//@route PUT api/livepicks/manager/matchday/:mid/player/:pid
//@access ADMIN
const addPointsToPicks = asyncHandler(async (req, res) => {
  const allLives = await ManagerLive.find({});
  const player = await Player.findById(req.params.pid);
  const matchday = await Matchday.findById(req.params.mid);
  //const matchday = await Matchday.findOne({id: +req.params.mid})
  const mid = matchday._id;
  const { matchdays } = player;
  const mdPoints = matchdays.filter(
    (x) => x.matchday.toString() === mid.toString()
  )[0].matchdayPoints;
  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  }
  if (!player) {
    res.status(400);
    throw new Error("No player found");
  }
  for (let i = 0; i < allLives.length; i++) {
    const mLive = await ManagerLive.findOne({ user: allLives[i].user });
    const mLivePicks = mLive.livePicks;

    const a = mLivePicks.filter(
      (x) => x.matchdayId.toString() === req.params.mid
    );
    a.length > 0 &&
      a[0].picks.map((x) =>
        x._id.toString() === req.params.pid.toString()
          ? (x.points = mdPoints)
          : x.points
      );

    await ManagerLive.findOneAndUpdate(
      { user: allLives[i].user },
      { livePicks: mLivePicks },
      { new: true }
    );
  }
  res.status(200).send(allLives);
});

//@desc delete player scores in picks
//@route DELETE api/livepicks/manager/matchday/:mid/fixtures/:id
//@access ADMIN
const deletePoints = asyncHandler(async (req, res) => {
  const allLives = await ManagerLive.find({});
  const fixture = await Fixture.findById(req.params.id);
  const matchday = await Matchday.findOne({ id: +req.params.mid });
  const mid = matchday._id;
  const { teamAway, teamHome } = fixture;
  const players = await Player.find({
    $or: [{ playerTeam: teamAway }, { playerTeam: teamHome }],
  });
  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }
  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  }
  if (!players) {
    res.status(400);
    throw new Error("No players found");
  }
  for (let i = 0; i < players.length; i++) {
    const { _id } = players[i];
    //const mdPoints = matchdays.filter(x => x.matchday.toString() === mid.toString())[0].matchdayPoints

    for (let i = 0; i < allLives.length; i++) {
      const mLive = await ManagerLive.findOne({ user: allLives[i].user });
      const mLivePicks = mLive.livePicks;

      const a = mLivePicks.filter(
        (x) => x.matchdayId.toString() === mid.toString()
      );
      a[0].picks.map((x) =>
        x._id.toString() === _id.toString() ? (x.points = null) : x.points
      );

      await ManagerLive.findOneAndUpdate(
        { user: allLives[i].user },
        { livePicks: mLivePicks },
        { new: true }
      );
    }
  }
  res.status(200).send(allLives);
});

//@desc update player scores in picks
//@route PUT api/livepicks/manager/matchday/:mid/matchdayscore
//@access ADMIN
const updateMatchdayScore = asyncHandler(async (req, res) => { });

//@desc update player scores in picks
//@route PUT api/livepicks/manager/matchday/:mid/matchdayrank
//@access ADMIN
const updateMatchdayRank = asyncHandler(async (req, res) => { });

//@desc Get live picks
//@route GET api/livepicks/manager/:id
//@access private
const getLivePicks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const managerInfo = await ManagerInfo.findOne({
    $or: [{ user: req.params.id }, { _id: req.params.id }],
  });
  const { _id } = managerInfo;
  const picks = await ManagerLive.find({ manager: _id });

  if (!user && !picks) {
    res.status(400);
    throw new Error("User not found");
  }

  if (!picks) {
    res.status(400);
    throw new Error("Manager not found");
  }

  res.status(200).json({ picks, managerInfo });
});

//@desc Get specific live picks
//@route GET api/livepicks/manager/:id/matchday/:mid
//@access private
const getRound = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const allLivePicks = await ManagerLive.findOne({ user: req.params.id });
  const livePicks = allLivePicks.livePicks;
  const rlivePicks = livePicks.find(
    (live) => live.matchday === +req.params.mid
  );

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (!allLivePicks) {
    res.status(400);
    throw new Error("Manager not found");
  }

  if (!rlivePicks) {
    res.status(400);
    throw new Error("Invalid round");
  }

  res.status(200).json(rlivePicks);
});

export {
  getLivePicks,
  getRound,
  setLivePicks,
  setInitialPoints,
  addPointsToPicks,
  deletePoints,
};
