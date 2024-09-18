import asyncHandler from "express-async-handler";
import Picks from "../models/picksModel.js";
import ManagerLive from "../models/managerLive.js";
import Player from "../models/playerModel.js";
import User from "../models/userModel.js";
import Matchday from "../models/matchdayModel.js";
import Fixture from "../models/fixtureModel.js";
import ManagerInfo from "../models/managerInfoModel.js";

//@desc set live picks
//@route PUT api/livepicks/manager/  
//@access
const setLivePicks = asyncHandler(async (req, res) => { 
  const allPicks = await Picks.find({});
  const matchday = await Matchday.findOne({ current: true });
  const id = matchday.id;
  const mid = matchday._id;
  
  if(!matchday) {
    res.status(404)
    throw new Error(`No matchday found!`)
  }

  for (let i = 0; i < allPicks.length; i++) {
    const mLive = await ManagerLive.findOne({ user: allPicks[i].user });
    const mInfo = await ManagerInfo.findOne({ user: allPicks[i].user})
    const {matchdayJoined} = mInfo
    if (mLive === null) {
      if(id <= matchdayJoined) {
        await ManagerLive.create({
          user: allPicks[i].user,
          livePicks: [
            {
              matchday: id,
              matchdayId: mid,
              activeChip: null,
              picks: allPicks[i].picks,
              teamValue: allPicks[i].teamValue,
              bank: allPicks[i].bank
            },
          ],
        });
      }
      
    } else {
      const mLivePicks = mLive.livePicks;
      let idIndex = mLive.livePicks.findIndex((x) => x.matchday === id);
      let midIndex = mLive.livePicks.findIndex(
        (X) => X.matchdayId.toString() === mid.toString()
      );
      if (idIndex > -1 || midIndex > -1) {
        res.status(400);
        throw new Error("Matchday scores already exist");
      }
      const newLivePicks = [
        ...mLivePicks,
        {
          matchday: id,
          matchdayId: mid,
          activeChip: null,
          picks: allPicks[i].picks,
          teamValue: allPicks[i].teamValue,
          bank: allPicks[i].bank
        },
      ];
      await ManagerLive.findOneAndUpdate(
        { user: allPicks[i].user },
        { livePicks: newLivePicks },
        { new: true }
      );
    }
  }

  res.status(200).json(allPicks);
});

//@desc set initial points
//@route PUT api/livepicks/manager/matchday/:mid/start/fixtures/:id
//@access ADMIN
const setInitialPoints = asyncHandler(async (req, res) => {
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
    const { matchdays, _id } = players[i];
    const mdPoints = matchdays.filter(
      (x) => x.matchday.toString() === mid.toString()
    )[0].matchdayPoints;

    for (let i = 0; i < allLives.length; i++) {
      const mLive = await ManagerLive.findOne({ user: allLives[i].user });
      const mLivePicks = mLive.livePicks;

      const a = mLivePicks.filter((x) => x.matchday === +req.params.mid);
      a.length > 0 &&
        a[0].picks.map((x) =>
          x._id.toString() === _id.toString() ? (x.points = mdPoints) : x.points
        );

      await ManagerLive.findOneAndUpdate(
        { user: allLives[i].user },
        { livePicks: mLivePicks },
        { new: true }
      );
    }
  }
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
const updateMatchdayScore = asyncHandler(async (req, res) => {});

//@desc update player scores in picks
//@route PUT api/livepicks/manager/matchday/:mid/matchdayrank
//@access ADMIN
const updateMatchdayRank = asyncHandler(async (req, res) => {});

//@desc Get live picks
//@route GET api/livepicks/manager/:id
//@access private
const getLivePicks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const livePicks = await ManagerLive.find({ user: req.params.id }); 

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (!livePicks) {
    res.status(400);
    throw new Error("Manager not found");
  }

  res.status(200).json(livePicks);
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
