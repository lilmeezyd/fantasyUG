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
  const numberOfManagers =  await getAllManagers()
  const updatedPlayers =  Array.from(players).map(x => {
    const b = x.playerCount/numberOfManagers*100
    return {...x._doc, ownership: `${b.toFixed(1)}`}
  })
  res.status(200).json(updatedPlayers);
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
  const pFixtures = await Fixture.find({$or: [{ teamHome: team }, { teamAway: team }]})
  const pResults = await PlayerHistory.find({player: req.params.id})
  const { _doc } = player
  const newPlayer = {..._doc, fixtures: pFixtures, results: pResults} 
  res.status(200).json(newPlayer);
});

//@desc Get Players
//@route GET /api/players/:id/history
//@access public
//@role not restricted 
const getPlayerHistory = asyncHandler(async (req, res) => {
  const playerHistory = await PlayerHistory.find({player: req.params.id})
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
    res
      .status(200)
      .json({ msg: `${updatedPlayer.appName} updated`, updatedPlayer });
  }
/*
  if (req.body.matchday) {
    const matchdayIndex = player.matchdays.findIndex(
      (x) => x.matchday.toString() === req.body.matchday.toString()
    );

    Object.keys(req.body).forEach((val) => {
      if (
        val === "goalsScored" &&
        player.matchdays[matchdayIndex].goalsScored + req.body.goalsScored > -1
      ) {
        player.goalsScored += req.body.goalsScored;
        if (position.singularName === "Goalkeeper") {
          player.matchdays[matchdayIndex].goalsScored += req.body.goalsScored;
          player.matchdays[matchdayIndex].matchdayPoints +=
            6 * req.body.goalsScored;
          player.totalPoints += 6 * req.body.goalsScored;
        }
        if (position.singularName === "Defender") {
          player.matchdays[matchdayIndex].goalsScored += req.body.goalsScored;
          player.matchdays[matchdayIndex].matchdayPoints +=
            6 * req.body.goalsScored;
          player.totalPoints += 6 * req.body.goalsScored;
        }
        if (position.singularName === "Midfielder") {
          player.matchdays[matchdayIndex].goalsScored += req.body.goalsScored;
          player.matchdays[matchdayIndex].matchdayPoints +=
            5 * req.body.goalsScored;
          player.totalPoints += 5 * req.body.goalsScored;
        }
        if (position.singularName === "Forward") {
          player.matchdays[matchdayIndex].goalsScored += req.body.goalsScored;
          player.matchdays[matchdayIndex].matchdayPoints +=
            4 * req.body.goalsScored;
          player.totalPoints += 4 * req.body.goalsScored;
        }
      }
      if (
        val === "assists" &&
        player.matchdays[matchdayIndex].assists + req.body.assists > -1
      ) {
        player.matchdays[matchdayIndex].assists += req.body.assists;
        player.matchdays[matchdayIndex].matchdayPoints += 3 * req.body.assists;
        player.assists += req.body.assists;
        player.totalPoints += 3 * req.body.assists;
      }
      if (
        val === "ownGoals" &&
        player.matchdays[matchdayIndex].ownGoals + req.body.ownGoals > -1
      ) {
        player.matchdays[matchdayIndex].ownGoals += req.body.ownGoals;
        player.matchdays[matchdayIndex].matchdayPoints +=
          -2 * req.body.ownGoals;
        player.ownGoals += req.body.ownGoals;
        player.totalPoints += -2 * req.body.ownGoals;
      }
      if (
        val === "penaltiesSaved" &&
        player.matchdays[matchdayIndex].penaltiesSaved +
          req.body.penaltiesSaved >
          -1
      ) {
        player.matchdays[matchdayIndex].penaltiesSaved +=
          req.body.penaltiesSaved;
        player.matchdays[matchdayIndex].matchdayPoints +=
          5 * req.body.penaltiesSaved;
        player.penaltiesSaved += req.body.penaltiesSaved;
        player.totalPoints += 5 * req.body.penaltiesSaved;
      }
      if (
        val === "penaltiesMissed" &&
        player.matchdays[matchdayIndex].penaltiesMissed +
          req.body.penaltiesMissed >
          -1
      ) {
        player.matchdays[matchdayIndex].penaltiesMissed +=
          req.body.penaltiesMissed;
        player.matchdays[matchdayIndex].matchdayPoints +=
          -2 * req.body.penaltiesMissed;
        player.penaltiesMissed += req.body.penaltiesMissed;
        player.totalPoints += -2 * req.body.penaltiesMissed;
      }
      if (
        val === "yellowCards" &&
        player.matchdays[matchdayIndex].yellowCards + req.body.yellowCards > -1
      ) {
        player.matchdays[matchdayIndex].yellowCards += req.body.yellowCards;
        player.matchdays[matchdayIndex].matchdayPoints +=
          -1 * req.body.yellowCards;
        player.yellowCards += req.body.yellowCards;
        player.totalPoints += -1 * req.body.yellowCards;
      }
      if (
        val === "redCards" &&
        player.matchdays[matchdayIndex].redCards + req.body.redCards > -1
      ) {
        player.matchdays[matchdayIndex].redCards += req.body.redCards;
        player.matchdays[matchdayIndex].matchdayPoints +=
          -3 * req.body.redCards;
        player.redCards += req.body.redCards;
        player.totalPoints += -3 * req.body.redCards;
      }
      if (
        val === "saves" &&
        player.matchdays[matchdayIndex].saves + req.body.saves > -1
      ) {
        player.matchdays[matchdayIndex].matchdayPoints -= Math.floor(
          player.matchdays[matchdayIndex].saves / 3
        );
        player.totalPoints -= Math.floor(player.saves / 3);
        player.matchdays[matchdayIndex].saves += req.body.saves;
        player.saves += req.body.saves;
        player.matchdays[matchdayIndex].matchdayPoints += Math.floor(
          player.matchdays[matchdayIndex].saves / 3
        );
        player.totalPoints += Math.floor(player.saves / 3);
      }
      if (
        val === "cleansheets" &&
        player.matchdays[matchdayIndex].cleansheets + req.body.cleansheets > -1
      ) {
        player.cleansheets += req.body.cleansheets;
        if (position.singularName === "Goalkeeper") {
          player.matchdays[matchdayIndex].cleansheets += req.body.cleansheets;
          player.matchdays[matchdayIndex].matchdayPoints +=
            4 * req.body.cleansheets;
          player.totalPoints += 4 * req.body.cleansheets;
        }
        if (position.singularName === "Defender") {
          player.matchdays[matchdayIndex].cleansheets += req.body.cleansheets;
          player.matchdays[matchdayIndex].matchdayPoints +=
            4 * req.body.cleansheets;
          player.totalPoints += 4 * req.body.cleansheets;
        }
        if (position.singularName === "Midfielder") {
          player.matchdays[matchdayIndex].cleansheets += req.body.cleansheets;
          player.matchdays[matchdayIndex].matchdayPoints +=
            1 * req.body.cleansheets;
          player.totalPoints += 1 * req.body.cleansheets;
        }
        if (position.singularName === "Forward") {
          player.matchdays[matchdayIndex].cleansheets += req.body.cleansheets;
          player.matchdays[matchdayIndex].matchdayPoints +=
            0 * req.body.cleansheets;
          player.totalPoints += 0 * req.body.cleansheets;
        }
      }
      if (
        val === "started" &&
        player.matchdays[matchdayIndex].started + req.body.started > -1
      ) {
        player.matchdays[matchdayIndex].started += req.body.started;
        player.matchdays[matchdayIndex].matchdayPoints += 2 * req.body.started;
        player.started += req.body.started;
        player.totalPoints += 2 * req.body.started;
      }
      if (
        val === "offBench" &&
        player.matchdays[matchdayIndex].offBench + req.body.offBench > -1
      ) {
        player.matchdays[matchdayIndex].offBench += req.body.offBench;
        player.matchdays[matchdayIndex].matchdayPoints += 1 * req.body.offBench;
        player.offBench += req.body.offBench;
        player.totalPoints += 1 * req.body.offBench;
      }
      if (
        val === "bestPlayer" &&
        player.matchdays[matchdayIndex].bestPlayer + req.body.bestPlayer > -1
      ) {
        player.matchdays[matchdayIndex].bestPlayer += req.body.bestPlayer;
        player.matchdays[matchdayIndex].matchdayPoints +=
          5 * req.body.bestPlayer;
        player.bestPlayer += req.body.bestPlayer;
        player.totalPoints += 5 * req.body.bestPlayer;
      }
    });
    player.matchdayPoints = player.matchdays[matchdayIndex].matchdayPoints;
    const updatedPlayer = await Player.findByIdAndUpdate(
      req.params.id,
      player,
      { new: true }
    );
    res
      .status(200)
      .json({ msg: `${updatedPlayer.appName} updated`, updatedPlayer });
  }*/
});

//Increment Player number
const playerIncrement = asyncHandler(async (playerId, increment,  req, res) => {
  await Player.findByIdAndUpdate(playerId, {$inc: {playerCount: increment}})
})

//@desc delete player
//@route DELETE /api/players/:id
//@access private
//@role ADMIN
const deletePlayer = asyncHandler(async (req, res) => {
  console.log(req.params)
  console.log(req.body)
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
