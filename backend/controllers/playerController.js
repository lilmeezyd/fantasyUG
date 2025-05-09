import asyncHandler from "express-async-handler";
import Player from "../models/playerModel.js";
import User from "../models/userModel.js";
import Position from "../models/positionModel.js";
import Fixture from "../models/fixtureModel.js";
import PlayerHistory from "../models/playerHistoryModel.js";
import { getAllManagers } from "./userController.js";

//@desc Set Player
//@route POST /api/players
//@access Private
//@role Admin
const setPlayer = asyncHandler(async (req, res) => {
  let {
    firstName,
    secondName,
    appName,
    playerPosition,
    playerTeam,
    startCost,
  } = req.body;
  if (
    !firstName ||
    !secondName ||
    !appName ||
    !playerPosition ||
    !playerTeam ||
    !startCost
  ) {
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
   }*/

  /*firstName = firstName
    .trim()
    .split(" ")
    .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
    .join(" ");
  secondName = secondName
    .trim()
    .split(" ")
    .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
    .join(" ");
  appName = appName
    .split(" ")
    .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
    .join(" ");
    */

  const player = await Player.create({
    firstName,
    secondName,
    appName,
    playerPosition,
    playerTeam,
    startCost,
    nowCost: startCost,
  });
  res.status(200).json(player);
});

//@desc Get Players
//@route GET /api/players
//@access public
//@role not restricted
const getPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({});
  const numberOfManagers = await getAllManagers()
    
  if (players) {
    const updatedPlayers = players.map(player => {
      const { _id,
        firstName,
        secondName,
        appName,
        playerPosition,
        playerTeam,
        startCost,
        nowCost,
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
        playerCount } = player
      const b = numberOfManagers === 0 ? 0 : playerCount / numberOfManagers * 100
      return {
        _id, firstName, secondName, appName,
        playerPosition, playerTeam, startCost, nowCost, totalPoints, goalsScored,
        assists, ownGoals, penaltiesSaved, penaltiesMissed, yellowCards, redCards, saves,
        cleansheets, starts, ownership: `${b?.toFixed(1)}`
      }
    }).sort((a,b) => a.appName-b.appName ? 1:-1)
    res.status(200).json(updatedPlayers)
  }
});

//@desc Get Players
//@route GET /api/players/:id
//@access public
//@role not restricted 
const getPlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    res.status(400);
    throw new Error("Player not found");
  }

  const team = player?.playerTeam
  const pFixtures = await Fixture.find({ $or: [{ teamHome: team }, { teamAway: team }] })
  const pResults = await PlayerHistory.find({ player: req.params.id })
  const numberOfManagers = await getAllManagers()
  const { _id, firstName, secondName, appName,
    playerPosition, playerTeam, startCost, nowCost, totalPoints, goalsScored,
    assists, ownGoals, penaltiesSaved, penaltiesMissed, yellowCards, redCards, saves,
    cleansheets, starts, playerCount } = player
  const b = numberOfManagers === 0 ? 0 : playerCount / numberOfManagers * 100
  const newPlayer = {
    _id, firstName, secondName, appName,
    playerPosition, playerTeam, startCost, nowCost, totalPoints, goalsScored,
    assists, ownGoals, penaltiesSaved, penaltiesMissed, yellowCards, redCards, saves,
    cleansheets, starts, ownership: `${b.toFixed(1)}%`, fixtures: pFixtures, results: pResults
  }
  res.status(200).json(newPlayer);
});

//@desc Get Players
//@route GET /api/players/:id/history
//@access public
//@role not restricted 
const getPlayerHistory = asyncHandler(async (req, res) => {
  const playerHistory = await PlayerHistory.find({ player: req.params.id })
  res.status(200).json(playerHistory)
})

//@desc update player
//@route PUT /api/players/:id
//@access private
//@role ADMIN, EDITOR
const updatePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  const position = await Position.findById(player.playerPosition);

  // Find user
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN
  /*if (
    Object.values(user.roles).includes(1) &&
    Object.values(user.roles).length === 1
  ) {
    res.status(401);
    throw new Error("Not Authorized");
  }*/

  if (!player) {
    res.status(404);
    throw new Error("Player not found");
  }
  if (
    req.body.firstName ||
    req.body.secondName ||
    req.body.appName ||
    req.body.playerPosition ||
    req.body.playerTeam ||
    req.body.nowCost
  ) {
    /*Object.keys(req.body).forEach((val) => {
      if (val === "firstName") {
        req.body.firstName = req.body.firstName
          .split(" ")
          .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
          .join(" ");
      }
      if (val === "secondName") {
        req.body.secondName = req.body.secondName
          .split(" ")
          .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
          .join(" ");
      }
      if (val === "appName") {
        req.body.appName = req.body.appName
          .split(" ")
          .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
          .join(" ");
      }
    });*/
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedPlayer);
  }
});

//Increment Player number
const playerIncrement = asyncHandler(async (playerId, increment, session, req, res) => {
  await Player.findByIdAndUpdate(playerId, { $inc: { playerCount: increment } }, { session })
})

//@desc delete player
//@route DELETE /api/players/:id
//@access private
//@role ADMIN
const deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (!player) {
    res.status(404);
    throw new Error("Player not found");
  }

  // Find user
  const user = await User.findById(req.user.id).select("-password");
  /* if (!user) {
     res.status(400);
     throw new Error("User not found");
   }
   // Make sure the logged in user is an ADMIN
   if (!Object.values(user.roles).includes(2048)) {
     res.status(401);
     throw new Error("Not Authorized");
   }*/
  /*const doesExist = player.matchdays.length;
  if (doesExist > 0) {
    res.status(400);
    throw new Error(`Can't delete player involved in previous fixture`);
  }*/
  await Player.findByIdAndDelete(req.params.id);
  res.status(200).json({ id: req.params.id });
});

export { setPlayer, getPlayers, playerIncrement, getPlayer, getPlayerHistory, updatePlayer, deletePlayer };
