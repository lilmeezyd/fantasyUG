import asyncHandler from "express-async-handler";
import Fixture from "../models/fixtureModel.js";
import Stats from "../models/statsModel.js";
import Player from "../models/playerModel.js";
import PlayerHistory from "../models/playerHistoryModel.js";
import Position from "../models/positionModel.js";
import User from "../models/userModel.js";
import Matchday from "../models/matchdayModel.js";
import Team from "../models/teamModel.js";
import ManagerLive from "../models/managerLive.js";
import ManagerInfo from "../models/managerInfoModel.js";
import { rollbackFixtureStats } from "../services/rollbackFixtureStats.js";
import mongoose from "mongoose";
import { setInitialPoints } from "./managerLiveController.js";

//@desc Set Fixture
//@route POST /api/fixtures
//@access Private
//@role Admin
const setFixture = asyncHandler(async (req, res) => {
  const { matchday, kickOffTime, teamAway, teamHome } = req.body;
  if (!matchday || !kickOffTime || !teamAway || !teamHome) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  // Find user
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN
  /* if (!Object.values(user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not Authorized");
  } */
  const fixture = await Fixture.create({
    matchday,
    kickOffTime,
    teamAway,
    teamHome,
  });

  //Update matchday deadline to an hour before first kickoff
  const fixtures = await Fixture.find({ matchday });
  const firstKickOff = fixtures.sort((x, y) => {
    if (x.kickOffTime > y.kickOffTime) return 1;
    if (x.kickOffTime < y.kickOffTime) return -1;
  })[0].kickOffTime;
  const deadline = new Date(firstKickOff);
  deadline.setMinutes(deadline.getMinutes() - 60);
  await Matchday.findByIdAndUpdate(
    matchday,
    { deadlineTime: deadline },
    { new: true }
  );
  res.status(200).json(fixture);
});

//@desc Get Fixtures
//@route GET /api/fixtures
//@access public
//@role not restricted
const getFixtures = asyncHandler(async (req, res) => {
  const b = [];
  //const fixtures = await Fixture.find({});
  const fixtures = await Fixture.aggregate([
    { $group: { _id: "$matchday", fixtures: { $addToSet: "$$ROOT" } } },
  ]);
  await Matchday.populate(fixtures, { path: "_id" });
  fixtures.forEach((x) => {
    x.fixtures.sort((v, w) => (v.kickOffTime > w.kickOffTime ? 1 : -1));
    b.push(x);
  });
  res.status(200).json(b);
});

//@desc Set stats for a specific fixture
//@route PUT /api/fixtures/:id/populate
//@access private
//@role ADMIN & EDITOR
const populateStats = asyncHandler(async (req, res) => {
  const fixtureId = req.params.id;
  const mdFixture = await Fixture.findById(req.params.id);
  const matchday = await Matchday.findById(mdFixture?.matchday);
  if (!matchday.current) {
    throw new Error("Fixture not in current matchday");
  }
  const fixture = await Fixture.findOneAndUpdate(
    { _id: fixtureId, "stats.0": { $exists: false } }, // atomic guard
    {
      $set: {
        teamHomeScore: 0,
        teamAwayScore: 0,
        stats: [
          "goalsScored",
          "assists",
          "ownGoals",
          "penaltiesSaved",
          "penaltiesMissed",
          "yellowCards",
          "redCards",
          "saves",
          "cleansheets",
          "starts",
          "bestPlayer",
          "bench",
        ].map((identifier) => ({
          identifier,
          home: [],
          away: [],
        })),
      },
    },
    { new: true }
  ).lean();

  if (!fixture) {
    throw new Error("Fixture not found or already populated");
  }
  const players = await Player.find(
    { playerTeam: { $in: [fixture.teamHome, fixture.teamAway] } },
    { _id: 1, playerTeam: 1 }
  ).lean();

  if (!players.length) {
    throw new Error("No players found");
  }

  const ops = players.map((p) => ({
    insertOne: {
      document: {
        matchday: fixture.matchday,
        fixture: fixture._id,
        player: p._id,
        home: p.playerTeam.toString() === fixture.teamHome.toString(),
        opponent:
          p.playerTeam.toString() === fixture.teamHome.toString()
            ? fixture.teamAway
            : fixture.teamHome,
      },
    },
  }));

  let result;
  try {
    result = await PlayerHistory.bulkWrite(ops, { ordered: false });
  } catch (err) {
    // duplicate key errors expected on retry
    result = err.result;
  }

  res.status(200).json({
    message: "Fixture stats populated",
    expectedPlayers: ops.length,
    inserted: result?.insertedCount ?? 0,
    skipped: ops.length - (result?.insertedCount ?? 0),
  });
  /*const fixture = await Fixture.findById(req.params.id);
  const players = await Player.find({
    $or: [{ playerTeam: fixture.teamHome }, { playerTeam: fixture.teamAway }],
  });

  
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  const identifiers = {
    identifier1: "goalsScored",
    identifier2: "assists",
    identifier3: "ownGoals",
    identifier4: "penaltiesSaved",
    identifier5: "penaltiesMissed",
    identifier6: "yellowCards",
    identifier7: "redCards",
    identifier8: "saves",
    identifier9: "cleansheets",
    identifier10: "starts",
    identifier11: "bestPlayer",
    identifier12: "bench",
  };
  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }
  if (fixture.stats.length > 0) {
    res.status(400);
    throw new Error("Fixture already populated");
  }
  if (!players) {
    res.status(400);
    throw new Error("No players found");
  }
  Object.values(identifiers).forEach((identifier) => {
    const statObj = { identifier, away: [], home: [] };
    fixture.stats.push(statObj);
  });*/

  /*  const results = await Promise.allSettled(
    players.map((player) => {
      const isHomeTeam = fixture.teamHome === player.playerTeam;
      let opponent;
      if (player.playerTeam.toString() === fixture.teamAway.toString()) opponent = fixture.teamHome.toString();
      if (player.playerTeam.toString() === fixture.teamHome.toString()) opponent = fixture.teamAway.toString();

     /* console.log(player.playerTeam);
      console.log(opponent);

      return PlayerHistory.findOneAndUpdate(
        { fixture: req.params.id, player: player._id },
        { $set: { opponent } }
      );*/

  /* return PlayerHistory.create({
        matchday: fixture.matchday,
        player: player._id,
        fixture: fixture._id,
        opponent,
        home: isHomeTeam,
      });
    })
  );*/

  // Separate successes and failures
  /* const successes = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  const errors = results
    .filter((r) => r.status === "rejected")
    .map((r) => r.reason);

  fixture.teamAwayScore = 0;
  fixture.teamHomeScore = 0;
  const updatedFixture = await Fixture.findByIdAndUpdate(
    req.params.id,
    fixture,
    { new: true }
  );*/
  //res.status(200).json({ updatedFixture, successes, errors });
});

//@desc remove stats for a specific fixture
//@route PUT /api/fixtures/:id/depopulate
//@access private
//@role ADMIN & EDITOR
const dePopulateStats = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  const matchday = await Matchday.findById(req.params.mid);
  if (!matchday.current) {
    throw new Error("Fixture not in current matchday");
  }
  const allLives = await ManagerLive.find({});
  const players = await Player.find({
    $or: [{ playerTeam: fixture.teamHome }, { playerTeam: fixture.teamAway }],
  });
  const affectedPlayers = await PlayerHistory.find({
    fixture: req.params.id,
    matchday: req.params.mid,
  });
  const playerArray = affectedPlayers.map((x) => x.player);
  // Find user
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  }
  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }
  if (fixture.stats.length === 0) {
    res.status(400);
    throw new Error("Fixture already De-populated");
  }
  if (!players) {
    res.status(400);
    throw new Error("No players found");
  }
  
  fixture.stats.length = 0;
  fixture.teamAwayScore = null;
  fixture.teamHomeScore = null;
  rollbackFixtureStats(
    req.params.id,
    affectedPlayers,
  );
  const message = await setInitialPoints(
    "reset",
    req.params.id,
    req.params.mid,
    playerArray
  );

  const updatedFixture = await Fixture.findByIdAndUpdate(
    req.params.id,
    fixture,
    { new: true }
  );
  res.status(200).json({
    histFix: message.histFix,
     managerAgg: message.managerAgg,
    message: `Player Points Added and ${message.message}`,
    updatedFixture,
  });
});

//@desc Edit a specific fixture
//@route PUT /api/fixtures/:id
//@access private
//@role ADMIN, EDITOR
const editFixture = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  const { matchday, kickOffTime, teamAway, teamHome } = req.body;
  if (!matchday || !kickOffTime || !teamAway || !teamHome) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }
  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }
  const updatedFixture = await Fixture.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  //Update matchday deadline to an hour before first kickoff
  const fixtures = await Fixture.find({ matchday });
  const firstKickOff = fixtures.sort((x, y) => {
    if (x.kickOffTime > y.kickOffTime) return 1;
    if (x.kickOffTime < y.kickOffTime) return -1;
  })[0].kickOffTime;
  const deadline = new Date(firstKickOff);
  deadline.setMinutes(deadline.getMinutes() - 60);
  await Matchday.findByIdAndUpdate(
    matchday,
    { deadlineTime: deadline },
    { new: true }
  );
  console.log(updatedFixture);
  res.status(200).json(updatedFixture);
});

//@desc Set stats for a specific fixture
//@route PUT /api/fixtures/:id/stats
//@access private
//@role ADMIN, EDITOR
const editStats = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  if (!fixture) {
    throw new Error("Fixture not found");
  }

  let { teamHomeScore, teamAwayScore, matchday } = fixture;
  const isCurrent = await Matchday.findById(matchday).lean();
  const { current } = isCurrent;
  if (current === false) {
    throw new Error("Can not edit stats of a completed matchday!");
  }
  const { identifier, homeAway, player, value } = req.body;
  const newValue = Number(value);

  if (
    !identifier ||
    !homeAway ||
    value === undefined ||
    !Array.isArray(player) ||
    player.length === 0
  ) {
    throw new Error(
      "Please provide all required fields and at least one player"
    );
  }

  if (fixture.stats.length === 0) {
    throw new Error("Fixture stats not populated yet");
  }
  const players = await Player.find({ _id: { $in: player } }).lean();
  const positions = await Position.find({
    _id: { $in: players.map((p) => p.playerPosition) },
  }).lean();
  const posMap = new Map(positions.map((p) => [p._id.toString(), p.code]));
  const bulkHistory = [];
  const bulkPlayers = [];

  // Score tracking to prevent over-counting
  let homeDelta = 0;
  let awayDelta = 0;
  let oldFixture = fixture;

  // Utility function for weighted points
  const weightMap = {
    goalsScored: [10, 6, 5, 4, 0],
    cleansheets: [4, 4, 1, 0, 0],
    assists: 3,
    ownGoals: -2,
    penaltiesSaved: 5,
    penaltiesMissed: -2,
    yellowCards: -1,
    redCards: -3,
    saves: 0.5,
    starts: 2,
    bench: 1,
    bestPlayer: 3,
  };

  const getWeight = (id, code) =>
    Array.isArray(weightMap[id])
      ? weightMap[id][code - 1] || 0
      : weightMap[id] || 0;
  const statBlock = fixture.stats.find((x) => x.identifier === identifier);
  if (!statBlock) {
    throw new Error("Stat identifier not found in fixture");
  }

  const statArray = statBlock[homeAway];
  for (const p of players) {
    const code = posMap.get(p.playerPosition.toString());
    const points = getWeight(identifier, code) * newValue;
    const playerIndex = statArray.findIndex(
      (x) => x.player.toString() === p._id.toString()
    );
    if (playerIndex !== -1) {
      const currentVal = +statArray[playerIndex].value;
      const updatedVal = currentVal + newValue;

      if (updatedVal < 0) {
        throw new Error("Stat value cannot be negative");
      }

      if (updatedVal === 0) {
        statArray.splice(playerIndex, 1);
      } else {
        statArray[playerIndex].value = updatedVal;
      }
    } else {
      if (newValue <= 0) {
        throw new Error(
          "A negative value or 0 detected for an entry that does not exist in the stats array!"
        );
      }

      statArray.push({ player: p._id, value: newValue });
    }
    bulkHistory.push({
      updateOne: {
        filter: { player: p._id, fixture: fixture._id },
        update: {
          $inc: { [identifier]: newValue, totalPoints: points },
          $setOnInsert: {
            matchday: fixture.matchday,
            opponent:
              p.playerTeam.toString() === fixture.teamHome.toString()
                ? fixture.teamAway
                : fixture.teamHome,
            home: p.playerTeam.toString() === fixture.teamHome.toString(),
            player: p._id,
            fixture: fixture._id,
          },
        },
        upsert: true,
      },
    });

    bulkPlayers.push({
      updateOne: {
        filter: { _id: p._id },
        update: { $inc: { [identifier]: newValue, totalPoints: points } },
      },
    });

    if (identifier === "goalsScored") {
      p.playerTeam.equals(fixture.teamHome)
        ? (homeDelta += newValue)
        : (awayDelta += newValue);
    }
    if (identifier === "ownGoals") {
      p.playerTeam.equals(fixture.teamHome)
        ? (awayDelta += newValue)
        : (homeDelta += newValue);
    }
  }

  await PlayerHistory.bulkWrite(bulkHistory);
  await Player.bulkWrite(bulkPlayers);

  /*await Fixture.updateOne(
      { _id: fixture._id },
      {
        $inc: {
          teamHomeScore: homeDelta,
          teamAwayScore: awayDelta,
        },
      }
    );*/
  fixture.teamHomeScore = teamHomeScore + homeDelta;
  fixture.teamAwayScore = teamAwayScore + awayDelta;
  const updatedFixture = await Fixture.findByIdAndUpdate(
    req.params.id,
    fixture,
    { new: true }
  );
  // Fire and forget heavy recalculation
  const message = await setInitialPoints(
      "normal",
      req.params.id,
      matchday,
      player
    );
    res.status(200).json({
      histFix: message.histFix,
      managerAgg: message.managerAgg,
      message: `Player Points Added and ${message.message}`,
      updatedFixture,
    });
});

//@desc Get Fixture
//@route GET /api/fixtures/:id
//@access public
//@role Not restricted
const getFixture = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);

  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }

  res.status(200).json(fixture);
});

//@desc Delete Fixture
//@route DELETE /api/fixtures/:id
//@access private
//@role ADMIN EDITOR
const deleteFixture = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  const players = await Player.find({
    $or: [{ playerTeam: fixture.teamHome }, { playerTeam: fixture.teamAway }],
  });

  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }

  // Find user
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  if (!players) {
    res.status(400);
    throw new Error("No players found");
  } /*
  players.forEach(async (player) => {
    const matchdayIndex = player.matchdays.findIndex(
      (x) => x.matchday.toString() === fixture.matchday.toString()
    );
    if (player.matchdays && matchdayIndex > -1) {
      const deletedMD = player.matchdays.splice(matchdayIndex, 1);
      player.totalPoints -= deletedMD[0].matchdayPoints;
      player.goalsScored -= deletedMD[0].goalsScored;
      player.assists -= deletedMD[0].assists;
      player.ownGoals -= deletedMD[0].ownGoals;
      player.penaltiesSaved -= deletedMD[0].penaltiesSaved;
      player.penaltiesMissed -= deletedMD[0].penaltiesMissed;
      player.yellowCards -= deletedMD[0].yellowCards;
      player.redCards -= deletedMD[0].redCards;
      player.saves -= deletedMD[0].saves;
      player.cleansheets -= deletedMD[0].cleansheets;
      player.started -= deletedMD[0].started;
      player.offBench -= deletedMD[0].offBench;
      player.bestPlayer -= deletedMD[0].bestPlayer;

      player.matchdayPoints =
        player.matchdays.length === 0
          ? 0
          : player.matchdays[player.matchdays.length - 1].matchdayPoints;

      await Player.findByIdAndUpdate(player.id, player, { new: true });
      await Player.findByIdAndUpdate(
        player.id,
        {
          matchdayPoints: player.matchdayPoints,
          totalPoints: player.totalPoints,
          goalsScored: player.goalsScored,
          assists: player.assists,
          ownGoals: player.ownGoals,
          penaltiesSaved: player.penaltiesSaved,
          penaltiesMissed: player.penaltiesMissed,
          yellowCards: player.yellowCards,
          redCards: player.redCards,
          saves: player.saves,
          cleansheets: player.cleansheets,
          started: player.started,
          offBench: player.offBench,
          bestPlayer: player.bestPlayer,
        },
        { new: true }
      );
    }
  });*/
  await Fixture.findByIdAndDelete(req.params.id);
  const fixtures = await Fixture.find({ matchday: fixture.matchday });

  if (fixtures.length > 0) {
    const firstKickOff = fixtures.sort((x, y) => {
      if (x.kickOffTime > y.kickOffTime) return 1;
      if (x.kickOffTime < y.kickOffTime) return -1;
    })[0].kickOffTime;
    const deadline = new Date(firstKickOff);
    deadline.setMinutes(deadline.getMinutes() - 60);
    await Matchday.findByIdAndUpdate(
      fixture.matchday,
      { deadlineTime: deadline },
      { new: true }
    );
  }
  res.status(200).json({ id: req.params.id });
});

export {
  setFixture,
  getFixtures,
  getFixture,
  populateStats,
  dePopulateStats,
  editFixture,
  editStats,
  deleteFixture,
};
