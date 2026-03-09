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
import Weekly from "../models/weeklyStandingModel.js";
import mongoose from "mongoose";
import Overall from "../models/overallStandingModel.js";
import { rollbackFixtureStats } from "../services/rollbackFixtureStats.js";

//@desc set live picks
//@route PATCH api/livepicks/manager/
//@access
const setLivePicks = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true }).lean();
  if (!matchday) {
    res.status(400);
    throw new Error("No matchday found!");
  }

  const matchdayNumber = matchday.id;
  const matchdayId = matchday._id;

  await Picks.aggregate([
    {
      $lookup: {
        from: "managerinfos",
        localField: "manager",
        foreignField: "_id",
        as: "managerInfo",
      },
    },
    { $unwind: "$managerInfo" },
    {
      $match: {
        "managerInfo.matchdayJoined": { $lte: matchdayNumber },
      },
    },
    {
      $project: {
        manager: 1,
        picks: 1,
        teamValue: 1,
        bank: 1,
        matchday: { $literal: matchdayNumber },
        matchdayId: { $literal: matchdayId },
        activeChip: { $literal: null },
      },
    },
    {
      $merge: {
        into: "managerlives",
        on: ["manager", "matchdayId"],
        whenMatched: "keepExisting",
        whenNotMatched: "insert",
      },
    },
  ]);

  await ManagerInfo.updateMany(
    { matchdayJoined: { $lte: matchdayNumber } },
    { $set: { matchdayPoints: 0 } },
  );

  await Overall.updateMany({}, [{ $set: { oldRank: "$rank" } }]);

  res.status(200).json({
    message: "Live picks processed successfully",
  });
});

//@desc set initial points
//@route PATCH api/livepicks/manager/matchday/:mid/start/fixtures/:id
//@access ADMIN
const setInitialPoints = asyncHandler(async (format, fid, mid, playerArray) => {
  const matchday = await Matchday.findById(mid).lean();
  const matchdayObj = new mongoose.Types.ObjectId(mid);
  const fixtureObj = new mongoose.Types.ObjectId(fid);
  const playerObjIds = playerArray.map((id) => new mongoose.Types.ObjectId(id));
  /* if (format === "reset") {
    rollbackFixtureStats(fid, playerArray);
  }*/
  // Step 1: Aggregate PlayerHistory → precompute stats
  const histFix = await Player.aggregate([
    {
      $match: {
        _id: { $in: playerObjIds },
      },
    },
    {
      $lookup: {
        from: "playerhistories",
        let: { playerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$player", "$$playerId"] },
                  { $eq: ["$matchday", matchdayObj] },
                ],
              },
            },
          },
        ],
        as: "history",
      },
    },
    {
      $unwind: {
        path: "$history",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: { player: "$_id", matchday: matchdayObj },
        starts: { $sum: { $ifNull: ["$history.starts", 0] } },
        bench: { $sum: { $ifNull: ["$history.bench", 0] } },
        totalPoints: { $sum: { $ifNull: ["$history.totalPoints", 0] } },
      },
    },
    {
      $merge: {
        into: "PlayerStatsTemp",
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    },
  ]);

  // Step 2: Update ManagerLive picks with stats
  const managerAgg = await ManagerLive.aggregate([
    {
      $match: {
        matchdayId: matchdayObj,
        "picks._id": { $in: playerObjIds },
      },
    },
    { $unwind: "$picks" },
    {
      $lookup: {
        from: "PlayerStatsTemp",
        let: { pickId: "$picks._id", mdId: "$matchdayId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id.player", "$$pickId"] },
                  { $eq: ["$_id.matchday", "$$mdId"] },
                ],
              },
            },
          },
        ],
        as: "stats",
      },
    },
    {
      $set: {
        "picks.starts": {
          $cond: [
            { $gt: [{ $size: "$stats" }, 0] },
            { $arrayElemAt: ["$stats.starts", 0] },
            { $ifNull: ["$picks.starts", 0] },
          ],
        },
        "picks.bench": {
          $cond: [
            { $gt: [{ $size: "$stats" }, 0] },
            { $arrayElemAt: ["$stats.bench", 0] },
            { $ifNull: ["$picks.bench", 0] },
          ],
        },
        "picks.points": {
          $cond: [
            { $gt: [{ $size: "$stats" }, 0] },
            { $arrayElemAt: ["$stats.totalPoints", 0] },
            { $ifNull: ["$picks.points", 0] },
          ],
        },
      },
    },
    {
      $group: {
        _id: { manager: "$manager", matchdayId: "$matchdayId" }, // group by manager+matchday
        manager: { $first: "$manager" },
        matchdayId: { $first: "$matchdayId" },
        matchday: { $first: "$matchday" },
        activeChip: { $first: "$activeChip" },
        matchdayRank: { $first: "$matchdayRank" },
        teamValue: { $first: "$teamValue" },
        bank: { $first: "$bank" },
        automaticSubs: { $first: "$automaticSubs" },
        picks: { $push: "$picks" },
        matchdayPoints: {
          $sum: {
            $cond: [
              { $gt: ["$picks.multiplier", 0] },
              { $multiply: ["$picks.points", "$picks.multiplier"] },
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0, // drop the artificial group _id
        manager: 1,
        matchdayId: 1,
        matchday: 1,
        activeChip: 1,
        matchdayRank: 1,
        teamValue: 1,
        bank: 1,
        automaticSubs: 1,
        picks: 1,
        matchdayPoints: 1,
      },
    },
    {
      $merge: {
        into: "managerlives",
        on: ["manager", "matchdayId"],
        whenMatched: "replace",
        whenNotMatched: "discard",
      },
    },
  ]);

  //console.log(managerAgg.length);
  //res.status(200).json({message: "Points updated successfully for all managers."});
  return {
    managerAgg,
    histFix,
    message: "Points updated successfully for all managers.",
  };
});

const setPointsWithAutoSubs = asyncHandler(async (format, mid) => {
  const matchday = await Matchday.findById(mid).lean();
  const matchdayObj = new mongoose.Types.ObjectId(mid);
  /*const fixtureObj = new mongoose.Types.ObjectId(fid);
  const playerObjIds = playerArray.map((id) => new mongoose.Types.ObjectId(id));*/
  // Step 1: Aggregate PlayerHistory → precompute stats
  await PlayerHistory.aggregate([
    {
      $match: {
        matchday: matchdayObj,
      },
    },
    {
      $group: {
        _id: { player: "$player", matchday: "$matchday" },
        starts: { $sum: "$starts" },
        bench: { $sum: "$bench" },
        totalPoints: { $sum: "$totalPoints" },
      },
    },
    {
      $merge: {
        into: "PlayerStatsTemp", // temporary collection
        whenMatched: "replace",
        whenNotMatched: "insert",
      },
    },
  ]);

  // Step 2: Update ManagerLive picks with stats
  const managerAgg = await ManagerLive.aggregate([
    {
      $match: {
        matchdayId: matchdayObj,
      },
    },
    { $unwind: "$picks" },
    {
      $lookup: {
        from: "PlayerStatsTemp",
        let: { pickId: "$picks._id", mdId: "$matchdayId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$_id.player", "$$pickId"] },
                  { $eq: ["$_id.matchday", "$$mdId"] },
                ],
              },
            },
          },
        ],
        as: "stats",
      },
    },
    {
      $set: {
        "picks.starts": {
          $ifNull: [{ $arrayElemAt: ["$stats.starts", 0] }, "$picks.starts"],
        },
        "picks.bench": {
          $ifNull: [{ $arrayElemAt: ["$stats.bench", 0] }, "$picks.bench"],
        },
        "picks.points": {
          $cond: [
            { $eq: [format, "reset"] },
            {
              $subtract: [
                "$picks.points",
                { $arrayElemAt: ["$stats.totalPoints", 0] },
              ],
            },
            {
              $ifNull: [
                { $arrayElemAt: ["$stats.totalPoints", 0] },
                "$picks.points",
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: { manager: "$manager", matchdayId: "$matchdayId" }, // group by manager+matchday
        manager: { $first: "$manager" },
        matchdayId: { $first: "$matchdayId" },
        matchday: { $first: "$matchday" },
        activeChip: { $first: "$activeChip" },
        matchdayRank: { $first: "$matchdayRank" },
        teamValue: { $first: "$teamValue" },
        bank: { $first: "$bank" },
        automaticSubs: { $first: "$automaticSubs" },
        picks: { $push: "$picks" },
        matchdayPoints: {
          $sum: {
            $cond: [
              { $gt: ["$picks.multiplier", 0] },
              { $multiply: ["$picks.points", "$picks.multiplier"] },
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0, // drop the artificial group _id
        manager: 1,
        matchdayId: 1,
        matchday: 1,
        activeChip: 1,
        matchdayRank: 1,
        teamValue: 1,
        bank: 1,
        automaticSubs: 1,
        picks: 1,
        matchdayPoints: 1,
      },
    },
    {
      $merge: {
        into: "managerlives",
        on: ["manager", "matchdayId"],
        whenMatched: "replace",
        whenNotMatched: "discard",
      },
    },
  ]);

  //console.log(managerAgg.length);
  //res.status(200).json({message: "Points updated successfully for all managers."});
  return {
    managerAgg,
    message: "Points updated successfully for all managers.",
  };
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
    (x) => x.matchday.toString() === mid.toString(),
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
      (x) => x.matchdayId.toString() === req.params.mid,
    );
    a.length > 0 &&
      a[0].picks.map((x) =>
        x._id.toString() === req.params.pid.toString()
          ? (x.points = mdPoints)
          : x.points,
      );

    await ManagerLive.findOneAndUpdate(
      { user: allLives[i].user },
      { livePicks: mLivePicks },
      { new: true },
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
        (x) => x.matchdayId.toString() === mid.toString(),
      );
      a[0].picks.map((x) =>
        x._id.toString() === _id.toString() ? (x.points = null) : x.points,
      );

      await ManagerLive.findOneAndUpdate(
        { user: allLives[i].user },
        { livePicks: mLivePicks },
        { new: true },
      );
    }
  }
  res.status(200).send(allLives);
});

//@desc update player scores in picks
//@route PUT api/livepicks/manager/matchday/:mid/matchdayscore
//@access ADMIN
const updateMatchdayScore = asyncHandler(async (req, res) => {});

//@desc update player scores in picks
//@route PUT api/livepicks/manager/matchday/:mid/matchdayrank
//@access ADMIN
const updateMatchdayRank = asyncHandler(async (req, res) => {});

//@desc Get live picks
//@route GET api/livepicks/manager/:id
//@access private
const getLivePicks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  const managerInfo = await ManagerInfo.findOne({
    $or: [{ user: req.params.id }, { _id: req.params.id }],
  });
  const { _id } = managerInfo;
  const managerPicks = await ManagerLive.find({ manager: _id });
  const picks = await ManagerLive.aggregate([
    { $match: { manager: _id } },
    { $unwind: "$livePicks" },
    { $sort: { "livePicks.matchday": 1, "livePicks.slot": 1 } },
    {
      $group: {
        _id: "$_id",
        manager: { $first: "$manager" },
        livePicks: { $push: "$livePicks" },
      },
    },
    { $project: { _id: 1, manager: 1, livePicks: 1 } },
  ]);

  // Post-process to sort livePicks.picks by slot
  const sortedPicks = picks.map((doc) => {
    doc.livePicks.forEach((lp) => {
      if (Array.isArray(lp.picks)) {
        lp.picks.sort((a, b) => a.slot - b.slot);
      }
    });
    return doc;
  });

  if (!user && !picks) {
    res.status(400);
    throw new Error("User not found");
  }

  if (!picks) {
    res.status(400);
    throw new Error("Manager not found");
  }

  res.status(200).json({ managerPicks, managerInfo });
});

//@desc Get specific live picks
//@route GET api/livepicks/manager/:id/matchday/:mid
//@access private
const getRound = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const managerInfo = await ManagerInfo.findOne({ _id: req.params.id }).lean();
  const league = await League.findOne({
    name: "Overall",
    leagueType: "Overall",
  }).lean();
  const livePicks = await ManagerLive.findOne({
    manager: req.params.id,
    matchday: Number(req.params.mid),
  }).lean();
  const weeklyLeagues = await Weekly.find({
    manager: managerInfo?._id,
    matchday: Number(req.params.mid),
  }).lean();
  const weeklyLeaguesMap = new Map(
    weeklyLeagues.map((x) => [x.leagueId.toString(), x]),
  );

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (!livePicks) {
    res.status(400);
    throw new Error("No picks found");
  }

  const newLivePicks = {
    ...livePicks,
    matchdayRank: weeklyLeaguesMap?.get(league._id.toString())?.rank ?? "-",
  };

  res.status(200).json({
    matchdayJoined: managerInfo?.matchdayJoined,
    livePicks: newLivePicks,
  });
});

export {
  getLivePicks,
  getRound,
  setLivePicks,
  setInitialPoints,
  addPointsToPicks,
  deletePoints,
  setPointsWithAutoSubs,
};
