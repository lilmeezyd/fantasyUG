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
    identifier12: "bench"
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
  fixture.teamAwayScore = 0;
  fixture.teamHomeScore = 0;
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
  const matchday = await Matchday.findById(req.params.mid);
  const allLives = await ManagerLive.find({});
  const players = await Player.find({
    $or: [{ playerTeam: fixture.teamHome }, { playerTeam: fixture.teamAway }],
  });
  const affectedPlayers = await PlayerHistory.find({
    fixture: req.params.id,
    matchday: req.params.mid,
  });
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
  const deletedFix = await PlayerHistory.deleteMany({ fixture: req.params.id });
  affectedPlayers.forEach(async (play) => {
    const {
      player,
      totalPoints,
      goalsScored,
      assists,
      ownGoals,
      penaltiesSaved,
      penaltiesMissed,
      yellowCards,
      redCards,
      saves,
      cleansheets,
      starts,
      bench,
      bestPlayer,
    } = play;
    await Player.findByIdAndUpdate(
      { _id: player },
      {
        $inc: {
          totalPoints: -totalPoints,
          goalsScored: -goalsScored,
          assists: -assists,
          ownGoals: -ownGoals,
          penaltiesSaved: -penaltiesSaved,
          penaltiesMissed: -penaltiesMissed,
          yellowCards: -yellowCards,
          redCards: -redCards,
          saves: -saves,
          cleansheets: -cleansheets,
          starts: -starts,
          bench: -bench,
          bestPlayer: -bestPlayer,
        },
      },
      { new: true }
    );
  });
  if (deletedFix) {
    for (let i = 0; i < allLives.length; i++) {
      const mLive = await ManagerLive.findOne({ manager: allLives[i].manager });
      const mLivePicks = mLive.livePicks;
      const mdPicks = mLivePicks.find(
        (x) => x.matchdayId.toString() === req.params.mid
      );
      const { matchday, matchdayId, activeChip, matchdayRank, teamValue, bank, matchdayPoints } =
        mdPicks;
      const { picks: unformattedPicks } = mdPicks;
      const formatted = await Promise.all(
        unformattedPicks.map(async (x) => {
          const {
            _id,
            playerPosition,
            playerTeam,
            multiplier,
            nowCost,
            IsCaptain,
            IsViceCaptain,
            slot,
          } = x;
          const inPlayers = players.findIndex(
            (y) => x._id.toString() === y._id.toString()
          );
          const playerDatas = await PlayerHistory.find({
            matchday: req.params.mid,
            player: _id,
          });
          const playerPoints = playerDatas.reduce(
            (a, b) => a + b.totalPoints,
            0
          );
          if (inPlayers > -1) {
            return {
              _id,
              playerPosition,
              playerTeam,
              multiplier,
              nowCost,
              IsCaptain,
              IsViceCaptain,
              slot,
              points: IsCaptain ? playerPoints * 2 : playerPoints,
            };
          } else {
            return x;
          }
        })
      );

      const newMdPoints = formatted
        .filter((x) => x.multiplier > 0)
        .reduce((x, y) => x + y.points, 0);
      const newFormatted = {
        picks: formatted,
        matchday,
        matchdayId,
        activeChip,
        matchdayRank,
        teamValue,
        bank,
        matchdayPoints: newMdPoints,
      };
      const superLives = mLivePicks.filter(
        (x) => x.matchdayId.toString() !== req.params.mid.toString()
      );
      superLives.push(newFormatted);
      const managerinfo = await ManagerInfo.findOneAndUpdate(
        { _id: allLives[i].manager },
        {
          $set: {
            matchdayPoints: newMdPoints,
            "teamLeagues.0.matchdayPoints": newMdPoints,
            "overallLeagues.0.matchdayPoints": newMdPoints,
          },
        },
        { new: true }
      );
      const managerlive = await ManagerLive.findOneAndUpdate(
        { manager: allLives[i].manager },
        { livePicks: superLives },
        { new: true }
      );

      const { teamLeagues, overallLeagues } = managerinfo;
      const startTeamMd = await Matchday.findById(
        teamLeagues[0].startMatchday.toString()
      );
      const endTeamMd = await Matchday.findById(
        teamLeagues[0].endMatchday.toString()
      );
      const startOverallMd = await Matchday.findById(
        overallLeagues[0].startMatchday.toString()
      );
      const endOverallMd = await Matchday.findById(
        overallLeagues[0].endMatchday.toString()
      );
      const { livePicks } = managerlive;
      const endTeamMdId = endTeamMd === null ? 100 : endTeamMd.id;
      const endOverallMdId = endOverallMd === null ? 100 : endOverallMd.id;
      const overallTeamPts = livePicks
        .filter(
          (x) => x.matchday >= startTeamMd.id && x.matchday <= endTeamMdId
        )
        .map((x) => x.matchdayPoints)
        .reduce((x, y) => x + y, 0);
      const overallOverallPts = livePicks
        .filter(
          (x) => x.matchday >= startOverallMd.id && x.matchday <= endOverallMdId
        )
        .map((x) => x.matchdayPoints)
        .reduce((x, y) => x + y, 0);
      const overallPts = livePicks
        .map((x) => x.matchdayPoints)
        .reduce((a, b) => a + b, 0);
      managerinfo.$set("overallPoints", overallPts);
      managerinfo.$set("teamLeagues.0.overallPoints", overallTeamPts);
      managerinfo.$set("overallLeagues.0.overallPoints", overallOverallPts);
      await managerinfo.save();
    }
  }

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
  let { teamHomeScore, teamAwayScore } = fixture;
  const { identifier, homeAway, player, value } = req.body;

  if (!identifier || !homeAway || !value) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (player.length === 0) {
    res.status(400);
    throw new Error('No players added!')
  }

  if (fixture.stats.length === 0) {
    res.status(400);
    throw new Error("Fixture not populated yet");
  }


  // Find user
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (player.length > 0) {
    for (let i = 0; i < player.length; i++) {
      const playerFound = player[i] ? await Player.findById(player[i]) : "";
      if (!playerFound) {
        res.status(400);
        throw new Error("Player not found");
      }

      const _code =
        playerFound && (await Position.findOne(playerFound.playerPosition));
      const { code } = _code;
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
        goalsScored:
          code === 1 ? 10 : code === 2 ? 6 : code === 3 ? 5 : code === 4 ? 4 : 0,
        assists: 3,
        ownGoals: -2,
        penaltiesSaved: 5,
        penaltiesMissed: -2,
        yellowCards: -1,
        redCards: -3,
        saves: 0.5,
        cleansheets: code === 1 ? 4 : code === 2 ? 4 : code === 3 ? 1 : 0,
        starts: 2,
        bench: 1,
        bestPlayer: 3,
      };
      let playerIn = fixture.stats
        .filter((x) => x.identifier === identifier)[0]
      [homeAway].some((x) => x.player.toString() === retrievedPlayer.toString());
      let newValue = +value;
      let totalPoints;
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
          totalPoints = weight[identifier] * newValue;
          await PlayerHistory.findOneAndUpdate(
            { player: retrievedPlayer, fixture: req.params.id },
            { $inc: { [identifier]: newValue, totalPoints } },
            { new: true }
          );
          await Player.findByIdAndUpdate(
            retrievedPlayer,
            { $inc: { totalPoints, [identifier]: newValue } },
            { new: true }
          );
        } else {
          totalPoints = weight[identifier] * newValue;
          fixture.stats
            .filter((x) => x.identifier === identifier)[0]
          [homeAway].splice(playerIndex, 1, {
            player: retrievedPlayer,
            value: newValue + a,
          });
         await PlayerHistory.findOneAndUpdate(
            { player: retrievedPlayer, fixture: req.params.id },
            { $inc: { [identifier]: newValue, totalPoints } },
            { new: true }
          );
          await Player.findByIdAndUpdate(
            retrievedPlayer,
            { $inc: { totalPoints, [identifier]: newValue } },
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
        totalPoints = weight[identifier] * +value;
        await PlayerHistory.findOneAndUpdate(
          { player: retrievedPlayer, fixture: req.params.id },
          { $inc: { [identifier]: +value, totalPoints } },
          { new: true }
        );

        await Player.findByIdAndUpdate(
          retrievedPlayer,
          { $inc: { totalPoints, [identifier]: +value } },
          { new: true }
        );
      }

      if (identifier === "goalsScored") {
        if (homeAway === "away") {
          fixture.teamAwayScore = teamAwayScore += newValue;
        }
        if (homeAway === "home") {
          fixture.teamHomeScore = teamHomeScore += newValue;
        }
      }
      if (identifier === "ownGoals") {
        if (homeAway === "home") {
          fixture.teamAwayScore = teamAwayScore += newValue;
        }
        if (homeAway === "away") {
          fixture.teamHomeScore = teamHomeScore += newValue;
        }
      }
    }
    const updatedFixture = await Fixture.findByIdAndUpdate(
      req.params.id,
      fixture,
      { new: true }
    );
    res.status(200).json(updatedFixture);
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
