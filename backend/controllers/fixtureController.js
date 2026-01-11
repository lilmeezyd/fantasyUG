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
  const fixture = await Fixture.findById(req.params.id);
  const players = await Player.find({
    $or: [{ playerTeam: fixture.teamHome }, { playerTeam: fixture.teamAway }],
  });

  // Find user
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
  });

  const results = await Promise.allSettled(
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

      return PlayerHistory.create({
        matchday: fixture.matchday,
        player: player._id,
        fixture: fixture._id,
        opponent,
        home: isHomeTeam,
      });
    })
  );

  // Separate successes and failures
  const successes = results
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
  );
  res.status(200).json({ updatedFixture, successes, errors });
});

//@desc remove stats for a specific fixture
//@route PUT /api/fixtures/:id/depopulate
//@access private
//@role ADMIN & EDITOR
const dePopulateStats = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  const matchday = await Matchday.findById(req.params.mid);
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
  await setInitialPoints(
    req,
    res,
    "reset",
    req.params.id,
    req.params.mid,
    playerArray
  );
  fixture.stats.length = 0;
  fixture.teamAwayScore = null;
  fixture.teamHomeScore = null;
  rollbackFixtureStats(
    req.params.id,
    req.params.mid,
    affectedPlayers,
    allLives
  );

  const updatedFixture = await Fixture.findByIdAndUpdate(
    req.params.id,
    fixture,
    { new: true }
  );
  res.status(200).json(updatedFixture);
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
  if (!fixture) {
    throw new Error("Fixture not found");
  }

  let { teamHomeScore, teamAwayScore, matchday } = fixture;
  const isCurrent = await Matchday.findOne({ _id: matchday });
  const { current } = isCurrent;
  if (current === false) {
    throw new Error("Can not edit stats of a completed matchday!");
  }
  const { identifier, homeAway, player, value } = req.body;
  const newValue = +value;

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

  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    throw new Error("User not found");
  }

  // Score tracking to prevent over-counting
  let homeGoalDelta = 0;
  let awayGoalDelta = 0;
  let oldFixture = fixture;

  // Utility function for weighted points
  const getWeight = (identifier, code) => {
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
    const value = weightMap[identifier];
    return Array.isArray(value) ? value[code - 1] || 0 : value || 0;
  };
  // Arrays for rollbacks
  let playerHistoryArray = [];
  let playerArray = [];
  let message = null;
  const statBlock = fixture.stats.find((x) => x.identifier === identifier);
  if (!statBlock) {
    throw new Error("Stat identifier not found in fixture");
  }
  try {
    for (const playerId of player) {
      const playerFound = await Player.findById(playerId);
      if (!playerFound) {
        throw new Error("Player not found");
      }

      if (
        (homeAway === "home" &&
          playerFound.playerTeam.toString() !== fixture.teamHome.toString()) ||
        (homeAway === "away" &&
          playerFound.playerTeam.toString() !== fixture.teamAway.toString())
      ) {
        throw new Error("Player does not belong to the selected team");
      }

      const position = await Position.findOne(playerFound.playerPosition);
      const code = position.code;
      const retrievedPlayer = playerFound._id;
      const statArray = statBlock[homeAway];
      const playerIndex = statArray.findIndex(
        (x) => x.player.toString() === retrievedPlayer.toString()
      );
      const weight = getWeight(identifier, code);

      let totalPoints = weight * newValue;

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

        await PlayerHistory.findOneAndUpdate(
          { player: retrievedPlayer, fixture: req.params.id },
          { $inc: { [identifier]: newValue, totalPoints } },
          { new: true, upsert: true }
        );
        playerHistoryArray.push(retrievedPlayer);

        await Player.findByIdAndUpdate(
          retrievedPlayer,
          { $inc: { [identifier]: newValue, totalPoints } },
          { new: true }
        );

        playerArray.push(retrievedPlayer);
      } else {
        if (newValue <= 0) {
          throw new Error("Stat value cannot be negative or 0");
        }

        statArray.push({ player: retrievedPlayer, value: newValue });

        await PlayerHistory.findOneAndUpdate(
          { player: retrievedPlayer, fixture: req.params.id },
          { $inc: { [identifier]: newValue, totalPoints } },
          { new: true, upsert: true }
        );

        playerHistoryArray.push(retrievedPlayer);

        await Player.findByIdAndUpdate(
          retrievedPlayer,
          { $inc: { [identifier]: newValue, totalPoints } },
          { new: true }
        );
        playerArray.push(retrievedPlayer);
      }

      if (identifier === "goalsScored") {
        if (homeAway === "home") homeGoalDelta += newValue;
        if (homeAway === "away") awayGoalDelta += newValue;
      }

      if (identifier === "ownGoals") {
        if (homeAway === "home") awayGoalDelta += newValue;
        if (homeAway === "away") homeGoalDelta += newValue;
      }
    }

    fixture.teamHomeScore = teamHomeScore + homeGoalDelta;
    fixture.teamAwayScore = teamAwayScore + awayGoalDelta;

    const updatedFixture = await Fixture.findByIdAndUpdate(
      req.params.id,
      fixture,
      {
        new: true,
      }
    );
    message = await setInitialPoints(
      req,
      res,
      "normal",
      req.params.id,
      matchday,
      player
    );
    res.status(200).json({
      message: `Player Points Added and ${message.message}`,
      updatedFixture,
    });
  } catch (error) {
    let negativeValue = -newValue;
    if (playerHistoryArray.length) {
      for (const playerId of player) {
        const playerFound = await Player.findById(playerId);
        const position = await Position.findOne(playerFound.playerPosition);
        const code = position.code;
        const weight = getWeight(identifier, code);
        let totalPoints = weight * negativeValue;
        await PlayerHistory.findOneAndUpdate(
          { player: playerId, fixture: req.params.id },
          { $inc: { [identifier]: negativeValue, totalPoints } },
          { new: true, upsert: true }
        );
      }
    }
    if (playerArray.length) {
      for (const playerId of player) {
        const playerFound = await Player.findById(playerId);
        const position = await Position.findOne(playerFound.playerPosition);
        const code = position.code;
        const weight = getWeight(identifier, code);
        let totalPoints = weight * negativeValue;
        await Player.findByIdAndUpdate(
          playerId,
          { $inc: { [identifier]: negativeValue, totalPoints } },
          { new: true }
        );
      }
    }

    if (message) {
      await setInitialPoints(req, res, "normal", req.params.id, matchday);
    }

    await Fixture.findByIdAndUpdate(req.params.id, oldFixture, {
      new: true,
    });
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
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
