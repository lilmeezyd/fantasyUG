import asyncHandler from "express-async-handler";
import Fixture from "../models/fixtureModel.js";
import Stats from "../models/statsModel.js";
import Player from "../models/playerModel.js";
import PlayerStats from "../models/playerStatsModel.js";
import User from "../models/userModel.js";
import Matchday from "../models/matchdayModel.js";

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
  if (!Object.values(user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not Authorized");
  }
  const fixture = await Fixture.create({
    matchday,
    kickOffTime,
    teamAway,
    teamHome,
  });
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
  const fixtures = await Fixture.find({});
  res.status(200).json(fixtures);
});

//@desc Set stats for a specific fixture
//@route PUT /api/fixtures/:id/populate
//@access private
//@role ADMIN EDITOR
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
  // Make sure the logged in user is an ADMIN OR EDITOR
  if (
    Object.values(req.user.roles).includes(1) &&
    Object.values(req.user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
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
    identifier10: "started",
    identifier11: "offBench",
    identifier12: "bestPlayer",
  };
  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }
  if (fixture.stats.length > 0) {
    res.status(400);
    throw new Error("Fixture already populated");
  }
  Object.values(identifiers).forEach((identifier) => {
    const statObj = { identifier, away: [], home: [] };
    fixture.stats.push(statObj);
  });
  if (!players) {
    res.status(400);
    throw new Error("No players found");
  }
  const singleMatchday = await PlayerStats.create({
    matchday: fixture.matchday,
  });

  players.forEach(async (player) => {
    player.matchdays && player.matchdays.push(singleMatchday);
    await Player.findByIdAndUpdate(player.id, player, { new: true });
    await Player.findByIdAndUpdate(
      player.id,
      { matchdayPoints: 0 },
      { new: true }
    );
  });

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

  // Make sure the logged in user is an ADMIN OR EDITOR
  if (
    Object.values(req.user.roles).includes(1) &&
    Object.values(req.user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
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
  res.status(200).json({ updatedFixture, msg: `Fixture Updated` });
});

//@desc Set stats for a specific fixture
//@route PUT /api/fixtures/:id/stats
//@access private
//@role ADMIN, EDITOR
const editStats = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  const { identifier, homeAway, player, value } = req.body;
  const playerFound = player ? await Player.findById(player) : "";
  if (fixture.stats.length === 0) {
    res.status(400);
    throw new Error("Fixture not populated yet");
  }
  if (!identifier || !homeAway || !playerFound || !value) {
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
  if (
    Object.values(user.roles).includes(1) &&
    Object.values(user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
  }

  if (homeAway === "away") {
    if (playerFound.playerTeam.toString() !== fixture.teamAway.toString()) {
      res.status(400);
      throw new Error(`This should be for one's team`);
    }
  }

  if (homeAway === "home") {
    if (playerFound.playerTeam.toString() !== fixture.teamHome.toString()) {
      res.status(400);
      throw new Error(`This should be for one's team`);
    }
  }

  const newPlayer = await Stats.create({ player });
  const retrievedPlayer = newPlayer.player;
  let playerIn = fixture.stats
    .filter((x) => x.identifier === identifier)[0]
    [homeAway].some((x) => x.player.toString() === retrievedPlayer.toString());
  let newValue = +value;
  if (playerIn) {
    let playerIndex = fixture.stats
      .filter((x) => x.identifier === identifier)[0]
      [homeAway].findIndex(
        (x) => x.player.toString() === retrievedPlayer.toString()
      );
    let a = +fixture.stats.filter((x) => x.identifier === identifier)[0][
      homeAway
    ][playerIndex].value;
    if (newValue + a === 0) {
      fixture.stats
        .filter((x) => x.identifier === identifier)[0]
        [homeAway].splice(playerIndex, 1);
    } else {
      fixture.stats
        .filter((x) => x.identifier === identifier)[0]
        [homeAway].splice(playerIndex, 1, {
          player: retrievedPlayer,
          value: newValue + a,
        });
    }
  } else {
    if (newValue === -1) {
      res.status(400);
      throw new Error(`Value can't be less than 0`);
    }
    fixture.stats
      .filter((x) => x.identifier === identifier)[0]
      [homeAway].push({ player: retrievedPlayer, value: +value });
  }
  const updatedFixture = await Fixture.findByIdAndUpdate(
    req.params.id,
    fixture,
    { new: true }
  );
  //res.json(updatedFixture)
  res.status(200).json({ updatedFixture, msg: `Fixture Updated` });
});

//@desc Update score for a specific fixture
//@route PUT /api/fixtures/:id/scores
//@access private
//@role ADMIN, EDITOR
const updateScore = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);

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
  // Make sure the logged in user is an ADMIN
  if (
    Object.values(user.roles).includes(1) &&
    Object.values(user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
  }
  if (fixture.stats.length > 0) {
    console.log("Fixture populated");
  } else {
    res.status(400);
    throw new Error(`Stats not populated or fixture not started`);
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
  // Make sure the logged in user is an ADMIN
  if (!Object.values(user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not Authorized");
  }
  if (!players) {
    res.status(400);
    throw new Error("No players found");
  }
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
  });
  await Fixture.findByIdAndDelete(req.params.id);
  const fixtures = await Fixture.find({ matchday: fixture.matchday });

  if (fixtures.length > 1) {
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
  editFixture,
  editStats,
  deleteFixture,
  updateScore,
};
