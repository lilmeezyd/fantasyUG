import asyncHandler from "express-async-handler";
import Fixture from "../models/fixtureModel.js";
import Stats from "../models/statsModel.js";
import Player from "../models/playerModel.js";
import PlayerHistory from "../models/playerHistoryModel.js";
import Position from "../models/positionModel.js"
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
  const fixtures = await Fixture.find({});
  res.status(200).json(fixtures);
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

  players.forEach(async (player) => {
    await PlayerHistory.create({
      matchday: fixture.matchday,
      player: player._id,
      fixture: fixture._id,
      opponent:
        fixture.teamAway === player.playerTeam
          ? fixture.teamHome
          : fixture.teamAway,
      home: fixture.teamHome === player.playerTeam ? true : false,
    });
  });
  fixture.teamAwayScore = 0
  fixture.teamHomeScore = 0

  
  const updatedFixture = await Fixture.findByIdAndUpdate(
    req.params.id,
    fixture,
    { new: true }
  );
  res.status(200).json(updatedFixture);
});

//@desc remove stats for a specific fixture
//@route PUT /api/fixtures/:id/depopulate
//@access private
//@role ADMIN & EDITOR
const dePopulateStats = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  /*const players = await Player.find({
    $or: [{ playerTeam: fixture.teamHome }, { playerTeam: fixture.teamAway }],
  });*/
  // Find user
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }
  if (fixture.stats.length === 0) {
    res.status(400);
    throw new Error("Fixture already De-populated");
  }

  fixture.stats.length = 0;
  fixture.teamAwayScore = null
  fixture.teamHomeScore = null
  await PlayerHistory.deleteMany({ fixture: req.params.id });
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
  /*if (
    Object.values(req.user.roles).includes(1) &&
    Object.values(req.user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
  }*/
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
  res.status(200).json(updatedFixture);
});

//@desc Set stats for a specific fixture
//@route PUT /api/fixtures/:id/stats
//@access private
//@role ADMIN, EDITOR
const editStats = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);
  let { teamHomeScore, teamAwayScore } = fixture
  const { identifier, homeAway, player, value } = req.body;
  const playerFound = player ? await Player.findById(player) : "";

   const _code = playerFound && await Position.findOne(playerFound.playerPosition)
   const { code } = _code

  if (fixture.stats.length === 0) {
    res.status(400);
    throw new Error("Fixture not populated yet");
  }
  if (!playerFound) {
    res.status(400);
    throw new Error("Player not found");
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

  const retrievedPlayer = playerFound._id;
  const weight = {
    goalsScored: code === 1 ? 10 : code === 2 ? 6 : code === 3 ? 5 : code === 4 ? 4 : 0,
    assists: 3,
    ownGoals: -2,
    penaltiesSaved: 5,
    penaltiesMissed: -2,
    yellowCards: -1,
    redCards: -3,
    saves: 0,
    cleansheets: code === 1 ? 4 : code === 2 ? 4 : code === 3 ? 1 : 0,
    starts: 1,
    bestPlayer: 3,
  };
  let playerIn = fixture.stats
    .filter((x) => x.identifier === identifier)[0]
    [homeAway].some((x) => x.player.toString() === retrievedPlayer.toString());
  let newValue = +value;
  const playerPoints = await PlayerHistory.findOne({ player: retrievedPlayer });
  let { totalPoints } = playerPoints;


  if (playerIn) {
    let playerIndex = fixture.stats
      .filter((x) => x.identifier === identifier)[0]
      [homeAway].findIndex(
        (x) => x.player.toString() === retrievedPlayer.toString()
      );
    let a = +fixture.stats.filter((x) => x.identifier === identifier)[0][
      homeAway
    ][playerIndex].value;
    if (newValue + a <= -1) {
      res.status(400);
      throw new Error(`Value can't be less than 0`);
    }
    if (newValue + a === 0) {
      fixture.stats
        .filter((x) => x.identifier === identifier)[0]
        [homeAway].splice(playerIndex, 1);
      totalPoints += weight[identifier] * newValue;
      await PlayerHistory.findOneAndUpdate(
        { player: retrievedPlayer },
        { [identifier]: newValue + a, totalPoints },
        { new: true }
      );
    } else {
      totalPoints += weight[identifier] * (newValue);
      fixture.stats
        .filter((x) => x.identifier === identifier)[0]
        [homeAway].splice(playerIndex, 1, {
          player: retrievedPlayer,
          value: newValue + a,
        });
      await PlayerHistory.findOneAndUpdate(
        { player: retrievedPlayer },
        { [identifier]: newValue + a, totalPoints },
        { new: true }
      );
    }
  } else {
    if (newValue <= -1) {
      res.status(400);
      throw new Error(`Value can't be less than 0`);
    }
    fixture.stats
      .filter((x) => x.identifier === identifier)[0]
      [homeAway].push({ player: retrievedPlayer, value: +value });
    totalPoints += weight[identifier] * +value;
    await PlayerHistory.findOneAndUpdate(
      { player: retrievedPlayer },
      { [identifier]: +value, totalPoints },
      { new: true }
    );
  }

  
  if(identifier === 'goalsScored') {
    if(homeAway === 'away') {
      fixture.teamAwayScore = teamAwayScore+=newValue
    }
    if(homeAway === 'home') {
      fixture.teamHomeScore = teamHomeScore+=newValue
    }
  }
  if(identifier === 'ownGoals') {
    if(homeAway === 'home') {
      fixture.teamAwayScore = teamAwayScore+=newValue
    }
    if(homeAway === 'away') {
      fixture.teamHomeScore = teamHomeScore+=newValue
    }
  }

  const updatedFixture = await Fixture.findByIdAndUpdate(
    req.params.id,
    fixture,
    { new: true }
  );
  res.status(200).json(updatedFixture);
  //res.status(200).json({ updatedFixture, msg: `Fixture Updated` });
});

//@desc Update score for a specific fixture
//@route PUT /api/fixtures/:id/scores
//@access private
//@role ADMIN, EDITOR
/*const updateScore = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);

  if (!fixture) {
    res.status(400);
    throw new Error("Fixture not found");
  }*/
  // Find user
 /* const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }*/
  // Make sure the logged in user is an ADMIN
  /*if (
    Object.values(user.roles).includes(1) &&
    Object.values(user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
  }*/
  /*if (fixture.stats.length > 0) {
    console.log("Fixture populated");
  } else {
    res.status(400);
    throw new Error(`Stats not populated or fixture not started`);
  }
});*/

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
  /*if (!Object.values(user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not Authorized");
  }*/
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
  deleteFixture
};