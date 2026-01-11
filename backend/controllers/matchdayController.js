import asyncHandler from "express-async-handler";
import Matchday from "../models/matchdayModel.js";
import ManagerLive from "../models/managerLive.js";
import ManagerInfo from "../models/managerInfoModel.js";
import PlayerHistory from "../models/playerHistoryModel.js";
import Position from "../models/positionModel.js";
import TOW from "../models/teamOfTheWeekModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { setInitialPoints } from "./managerLiveController.js";

//@desc Get recent matchday
//@route GET /api/matchdays/data/max/
//@access Public
const getMaxMD = asyncHandler(async (req, res) => {
  const matchdays = await Matchday.find({});
  if (matchdays.length > 0) {
    const newMd = Math.max(...matchdays.map((x) => x.id));
    res.status(200).json(newMd);
  } else {
    res.status(200).json(null);
  }
});

const getCurrentMD = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({current: true});
  if (!matchday) {
    throw new Error("Matchday not found!")
  } 
  const { id } = matchday
  res.json(id)
});

//@desc Get recent matchday
//@route GET /api/matchdays/data/max/
//@access Public
const getMinMD = asyncHandler(async (req, res) => {
  const matchdays = await Matchday.find({});
  if (matchdays.length > 0) {
    const newMd = Math.min(...matchdays.map((x) => x.id));
    res.status(200).json(newMd);
  } else {
    res.status(200).json(null);
  }
});

//@desc Set Matchday
//@route POST /api/matchdays
//@access Private
//@role ADMIN
const setMatchday = asyncHandler(async (req, res) => {
  let { name, deadlineTime } = req.body;
  //let timeString = new Date(deadlineTime).toISOString()
  if (!name) {
    res.status(400);
    throw new Error("Add matchday name!");
  }
  name =
    name &&
    name
      .split(" ")
      .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
      .join(" ");
  let id = +name.slice(8).trim();
  const nameExists = await Matchday.findOne({ name });
  const idExists = await Matchday.findOne({ id });

  //Find user
  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }
  if (!!id === false) {
    res.status(400);
    throw new Error("Entry has no id");
  }
  if (name.slice(0, 8).toLocaleLowerCase() !== "matchday") {
    res.status(400);
    throw new Error("name should start with matchday");
  }
  // Make sure the logged in user is an ADMIN
  /*if (!Object.values(req.user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not authorized");
  }*/
  //Check if matchday exists
  if (nameExists) {
    res.status(400);
    throw new Error("Matchday Exists");
  }
  if (idExists) {
    res.status(400);
    throw new Error("Id already taken");
  }
  if (!name || !deadlineTime) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const matchday = await Matchday.create({
    name,
    deadlineTime,
    id,
    next: id === 1 ? true : false,
  });
  res.status(200).json(matchday);
});

//@desc Get Matchdays
//@route GET /api/matchdays
//@access Public
//@role Admin, editor, normal_user
const getMatchdays = asyncHandler(async (req, res) => {
  const matchdays = await Matchday.find({});
  //const matchdays = await Matchday.find({}).select('-_id')
  res.status(200).json(matchdays);
});

//@desc Get Matchday
//@route GET /api/matchdays/:id
//@access Public
//@role normal_user
const getMatchday = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findById(req.params.id);
  //const matchdays = await Matchday.find({}).select('-_id')
  res.status(200).json(matchday);
});

//@desc Start Matchday
//@route PATCH /api/matchdays/:id
//@access Private
//@role ADMIN
const startMatchday = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findById(req.params.id);
  const matchdays = await Matchday.find({}).lean();
  const firstGW = Math.min(...matchdays.map(x => x.id))
  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  }

  const { id, next: isNext } = matchday;
  const prev = id > firstGW ? id - 1 : 0;
  const next = id + 1;
  if (!isNext) {
    res.status(400);
    throw new Error("Matchday is not the next one");
  }

  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }

  try {
    let updatedMatchday, nextMatchdayDoc;

    if (prev === 0) {
      // First matchday case
      updatedMatchday = await Matchday.findByIdAndUpdate(
        req.params.id,
        { next: false, current: true, pastDeadline: true },
        { new: true }
      );

      nextMatchdayDoc = await Matchday.findOneAndUpdate(
        { id: next },
        { next: true },
        { new: true }
      );
    } else {
      const prevMatchday = await Matchday.findOne({ id: prev });
      const nextMatchday = await Matchday.findOne({ id: next });

      if (!prevMatchday.finished || !prevMatchday.pastDeadline) {
        throw new Error(`Previous matchday isn't finished yet!`);
      }

      updatedMatchday = await Matchday.findByIdAndUpdate(
        req.params.id,
        { next: false, current: true, pastDeadline: true },
        { new: true }
      );

      if (nextMatchday) {
        nextMatchdayDoc = await Matchday.findByIdAndUpdate(
          nextMatchday._id,
          { next: true },
          { new: true }
        );
      }
    }

    res.status(200).json({
      message: "Matchday Started",
      currentMatchday: updatedMatchday,
      nextMatchday: nextMatchdayDoc || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//@desc Update Matchday
//@route PUT /api/matchdays/:id
//@access Private
//@role Admin, editor
const updateMatchday = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findById(req.params.id);

  //Find user
  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }
  // Make sure the logged in user is an ADMIN
  /*if (!Object.values(req.user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Not authorized");
  }*/

  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  } else {
    Object.keys(req.body).forEach((val) => {
      if (val === "name") {
        if (req.body.name.slice(0, 8).toLocaleLowerCase() !== "matchday") {
          res.status(400);
          throw new Error("name should start with matchday");
        }
        if (!!+req.body.name.slice(8).trim() === false) {
          res.status(400);
          throw new Error("Entry has no id");
        }
        req.body.name = req.body.name
          .split(" ")
          .map((x) => x[0].toLocaleUpperCase() + x.slice(1).toLocaleLowerCase())
          .join(" ");
      }
    });
    const updatedMatchday = await Matchday.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({ msg: `${updatedMatchday.name} updated` });
  }
});

//@desc Update Matchday Data
//@route PUT /api/matchdays/updateMdData/:id
//@access Private
//@role Admin, editor
const updateMDdata = asyncHandler(async (req, res) => {
  try {
    const matchdayFound = await Matchday.findById(req.params.id);
    if (!matchdayFound) {
      throw new Error("Matchday not found!");
    }

    // Uncomment to restrict update to current matchday
    if (!matchdayFound.current) {
      throw new Error("Matchday is not the current one!");
    }

    const allPlayers = await PlayerHistory.find({ matchday: req.params.id });
    if (allPlayers.length === 0) {
      throw new Error("No players in this matchday yet!");
    }

    const allLives = await ManagerLive.find();

    const entriesWithScore = allLives.map((x) => {
      const pick = x.livePicks.find(
        (p) => p.matchdayId.toString() === req.params.id.toString()
      );

      if (!pick) {
        return {
          manager: null,
          matchday: matchdayFound.id,
          matchdayId: req.params.id,
          matchdayPoints: null,
        };
      }

      return {
        manager: x.manager,
        matchday: pick.matchday,
        matchdayId: pick.matchdayId,
        matchdayPoints: pick.matchdayPoints ?? 0,
      };
    });

    const validScores =
      entriesWithScore.filter((x) => typeof x.matchdayPoints === "number") ??
      [];
    const highestScore = validScores.length
      ? Math.max(...validScores.map((x) => x.matchdayPoints))
      : 0;
    const totalPoints = validScores.reduce(
      (sum, x) => sum + x.matchdayPoints,
      0
    );
    const averageScore = Math.round(totalPoints / allLives.length) ?? 0;
    const highestScoringEntry = validScores.length
      ? validScores.find((x) => x.matchdayPoints === highestScore)?.manager
      : null;
    const highestPlayerPoints = allPlayers.length
      ? Math.max(...allPlayers.map((p) => p.totalPoints))
      : 0;
    const topPlayer = allPlayers.length
      ? allPlayers.find((p) => p.totalPoints === highestPlayerPoints)?.player
      : null;
    const updatedMatchday = await Matchday.findByIdAndUpdate(
      req.params.id,
      {
        highestScoringEntry,
        topPlayer,
        avergeScore: averageScore,
        highestScore,
      },
      { new: true }
    );

    res.status(200).json({ message: "Matchday data updated" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
});

//@desc Update Team of the week
//@route PUT /api/matchdays/updateTOW/:id
//@access Private
//@role Admin, editor
const updateTOW = asyncHandler(async (req, res) => {
  const matchdayFound = await Matchday.findById(req.params.id);
  if (!matchdayFound) {
    res.status(404);
    throw new Error("Matchday not found!");
  }

  const { id } = matchdayFound;

  // Dynamically load position mappings
  const positions = await Position.find({});
  const posObj = {},
    codeObj = {};
  positions.forEach((pos) => {
    posObj[pos._id.toString()] = pos.shortName;
    codeObj[pos._id.toString()] = pos.code;
  });
  const playerHistories = await PlayerHistory.find({
    matchday: req.params.id,
  }).populate("player");
  const playerMap = playerHistories.reduce((acc, curr) => {
    const player = curr.player;
    if (!player) return acc;

    const id = player._id.toString();
    if (!acc[id]) {
      acc[id] = { player, totalPoints: 0 };
    }
    acc[id].totalPoints += curr.totalPoints;
    return acc;
  }, {});

  const adPlayers = Object.values(playerMap);
  const sortedPlayers = adPlayers
    .map((x) => {
      const { _id, appName, playerPosition, playerTeam } = x.player;
      return {
        id: _id,
        player: appName,
        position: posObj[playerPosition.toString()],
        code: +codeObj[playerPosition.toString()],
        positionId: playerPosition,
        playerTeam,
        totalPoints: x.totalPoints,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Group players by position
  const grouped = { GKP: [], DEF: [], MID: [], FWD: [] };
  for (const p of sortedPlayers) {
    grouped[p.position]?.push(p);
  }
  for (const pos in grouped) {
    grouped[pos].sort((a, b) => b.totalPoints - a.totalPoints);
  }

  // Valid formations
  const formations = [
    { GKP: 1, DEF: 4, MID: 4, FWD: 2 },
    { GKP: 1, DEF: 4, MID: 3, FWD: 3 },
    { GKP: 1, DEF: 5, MID: 3, FWD: 2 },
    { GKP: 1, DEF: 5, MID: 2, FWD: 3 },
    { GKP: 1, DEF: 3, MID: 5, FWD: 2 },
    { GKP: 1, DEF: 3, MID: 4, FWD: 3 },
    { GKP: 1, DEF: 5, MID: 4, FWD: 1 },
    { GKP: 1, DEF: 4, MID: 5, FWD: 1 },
  ];

  let bestTeam = null,
    bestScore = -1,
    bestFormation = null;

  for (const formation of formations) {
    let team = [];
    let valid = true;
    let total = 0;

    for (const pos of ["GKP", "DEF", "MID", "FWD"]) {
      const needed = formation[pos] || 0;
      if (grouped[pos].length < needed) {
        valid = false;
        break;
      }
      const selected = grouped[pos].slice(0, needed);
      team.push(...selected);
      total += selected.reduce((sum, p) => sum + p.totalPoints, 0);
    }

    if (valid && team.length === 11 && total > bestScore) {
      bestScore = total;
      bestTeam = team;
      bestFormation = formation;
    }
  }

  //res.json({ bestTeam, bestScore, bestFormation });
  if (!bestTeam) {
    res.status(400);
    throw new Error("Not enough data to form a valid Team of the Week.");
  }

  const existing = await TOW.findOne({ matchdayId: req.params.id });

  if (existing) {
    const updated = await TOW.findOneAndUpdate(
      { matchdayId: req.params.id },
      {
        $set: {
          matchday: id,
          matchdayId: req.params.id,
          starOnes: bestTeam,
        },
      },
      { new: true }
    );
    res
      .status(201)
      .json({ team: updated, message: "Team of the week updateed" });
  } else {
    const created = await TOW.create({
      matchday: id,
      matchdayId: req.params.id,
      starOnes: bestTeam,
    });
    res
      .status(200)
      .json({ team: created, message: "Team of the week created" });
  }
});

//@desc Get Team of the week
//@route GET /api/matchdays/data/tows/:id
//@access Public
//@role Admin, editor, Normal User
const getTOW = asyncHandler(async (req, res) => {
  const tow = await TOW.findOne({ matchdayId: req.params.id });
  if (!tow) {
    res.status(404);
    throw new Error("No team of the week found");
  }
  res.status(200).json(tow);
});

//@route GET /api/matchdays/data/tows/
//@access Public
//@role Admin, editor, Normal User
const getTOWs = asyncHandler(async (req, res) => {
  const tows = await TOW.find({});
  if (!tows) {
    res.status(404);
    throw new Error("No team of the week found");
  }
  res.status(200).json(tows.slice(0, 7));
});

//@desc End Matchday
//@route PUT /api/matchdays/endmatchday/:id
//@access Private
//@role Admin, editor
const endMatchday = asyncHandler(async (req, res) => {
  const matchdayFound = await Matchday.findById(req.params.id);
  const matchdays = await Matchday.find({}).lean();
  const firstGW = Math.min(...matchdays.map(x => x.id))

  if (!matchdayFound) {
    res.status(404);
    throw new Error("Matchday not found");
  }

  if (!matchdayFound.current) {
    res.status(400);
    throw new Error("Matchday is not the current one!");
  }

  const { id } = matchdayFound;
  const prevId = id > firstGW ? id - 1 : null;

  if (prevId === null) {
    // First matchday - no previous to validate
    const updated = await Matchday.findByIdAndUpdate(
      req.params.id,
      { current: false, finished: true },
      { new: true }
    );
    return res.status(200).json(updated);
  }

  // Validate previous matchday is finished
  const prevMatchday = await Matchday.findOne({ id: prevId });

  if (!prevMatchday) {
    res.status(400);
    throw new Error("Previous matchday not found");
  }

  if (!prevMatchday.finished || !prevMatchday.pastDeadline) {
    res.status(400);
    throw new Error("Previous matchday is not finished or past deadline");
  }

  // Final update
  const updated = await Matchday.findByIdAndUpdate(
    req.params.id,
    { current: false, finished: true },
    { new: true }
  );

  res.status(200).json({ updated, message: "Matchday has come to an end" });
});

//@desc Create autosubs
//@route PATCH /api/matchdays/createautos/:id
//@access Private
//@role Admin, editor
const createAutos = asyncHandler(async (req, res) => {
  const matchdayFound = await Matchday.findById(req.params.id);
  const { current } = matchdayFound;
  const { id } = matchdayFound;
  if (!current) {
    res.status(400);
    throw new Error(`Matchday not current Matchday!`);
  }
  const managerLives = await ManagerLive.find({}).lean();
  const VALID_FORMATIONS = [
    { GKP: 1, DEF: 4, MID: 4, FWD: 2 },
    { GKP: 1, DEF: 4, MID: 3, FWD: 3 },
    { GKP: 1, DEF: 5, MID: 3, FWD: 2 },
    { GKP: 1, DEF: 5, MID: 2, FWD: 3 },
    { GKP: 1, DEF: 3, MID: 5, FWD: 2 },
    { GKP: 1, DEF: 3, MID: 4, FWD: 3 },
    { GKP: 1, DEF: 5, MID: 4, FWD: 1 },
    { GKP: 1, DEF: 4, MID: 5, FWD: 1 },
  ];
  const POSITIONS = {
    1: "GKP",
    2: "DEF",
    3: "MID",
    4: "FWD",
  };

  // Helpers
  const isValidFormation = ({ GKP, DEF, MID, FWD }) => {
    return VALID_FORMATIONS.some(
      (f) => f.GKP === GKP && f.DEF === DEF && f.MID === MID && f.FWD === FWD
    );
  };
  const getFormation = (picks) => {
    const formation = { GKP: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const pick of picks) {
      formation[POSITIONS[pick.playerPosition]]++;
    }
    return formation;
  };
  const clonePicks = (picks) => picks.map((p) => ({ ...p }));
  const applyAutoSubs = (picks) => {
    const updatedPicks = clonePicks(picks);
    const usedPlayerIds = new Set();
    const automaticSubs = [];

    const starters = updatedPicks
      .filter((p) => p.multiplier > 0)
      .sort((x, y) => (x.playerPosition > y.playerPosition ? 1 : -1));
    const bench = updatedPicks
      .filter((p) => p.multiplier === 0)
      .sort((a, b) => a.slot - b.slot);
      const newBench = [];
      const newStarters = []
    for (const pick of starters) {
      usedPlayerIds.add(pick._id.toString());
    }

    const playerCount = {
      GKP: starters.filter((x) => x.playerPosition === 1).length,
      DEF: starters.filter((x) => x.playerPosition === 2).length,
      MID: starters.filter((x) => x.playerPosition === 3).length,
      FWD: starters.filter((x) => x.playerPosition === 4).length,
    };
    for (const starter of starters) {
      if (+starter.starts === 0 && +starter.bench === 0) {
        for (const sub of bench) {
          if (
            (+sub.starts >= 1 || +sub.bench >= 1) &&
            !usedPlayerIds.has(sub._id.toString())
          ) {
            const starterPos = POSITIONS[starter.playerPosition];
            const subPos = POSITIONS[sub.playerPosition];

            // Only allow GKP-for-GKP, others can freely sub
            if (starterPos === "GKP" && subPos !== "GKP") continue;
            if (starterPos !== "GKP" && subPos === "GKP") continue;
            
            if (playerCount.DEF === 3 && starterPos === "DEF" && subPos !== "DEF") continue;
            if (playerCount.FWD === 1 && starterPos === "FWD" && subPos !== "FWD") continue;

  
            playerCount[starterPos]--;
            playerCount[subPos]++;

            // Try simulated substitution
             const simulated = starters.map((p) =>
              p._id.toString() === starter._id.toString() ? { ...sub, multiplier: 1 } : p
            );
            
            const formation = getFormation(simulated);
            if (isValidFormation(formation)) {
            // Apply substitution
            sub.multiplier = 1;
            starter.multiplier = 0;

            // Swap slots
            const subSlot = sub.slot;
            sub.slot = starter.slot;
            starter.slot = subSlot;

            usedPlayerIds.add(sub._id.toString());

            automaticSubs.push({
              in: sub,
              out: starter,
            });
            break;
            }
          }
        }
      }
    }

    return { newPicks: [...starters, ...bench], automaticSubs };
  };

  const applyCaptainFallback = (picks) => {
    const captainMissed = picks.find(
      (x) => x.IsCaptain === true && +x.starts === 0 && +x.bench === 0
    );
    const vice = picks.find(
      (x) => x.IsViceCaptain === true && (+x.starts >= 1 || +x.bench >= 1)
    );
    if (captainMissed && vice) {
      return picks.map((pick) =>
        pick.IsCaptain === true
          ? { ...pick, multiplier: pick.multiplier === 0 ? 0 : 1 }
          : pick.IsViceCaptain === true
          ? { ...pick, multiplier: 2, points: pick.points }
          : pick
      );
    }
    return picks;
  };
  const createSubs = (picks) => {
    let captainFallback = applyCaptainFallback(picks);
    let finalPicks = applyAutoSubs(captainFallback);
    return finalPicks;
  };
  const bulkOps = managerLives.map((lives) => {
    const { _id, livePicks } = lives;
    const mdPicks = livePicks.find((x) => x.matchday === id) ?? [];
    const { picks, automaticSubs: oldSubs } = mdPicks;
    const newPicksAndSubs = createSubs(picks);
    const { automaticSubs: newSubs, newPicks } = newPicksAndSubs;
    const newMdPicks = livePicks.map((x) =>
      x.matchday === id
        ? {
            ...x,
            automaticSubs: [...oldSubs, ...newSubs],
            picks: newPicks.sort((a, b) => a.slot - b.slot),
          }
        : x
    );
    return {
      updateOne: {
        filter: { _id: _id },
        update: { $set: { livePicks: newMdPicks } },
      },
    };
  });
  await ManagerLive.bulkWrite(bulkOps);
  const message = await setInitialPoints(req, res, req.params.id);
  res.json({ managerLives, message: `Autosubs made and ${message.message}.`});
});

//@desc Undo autosubs
//@route PATCH /api/matchdays/undoautos/:id
//@access Private
//@role Admin, editor
const undoAutos = asyncHandler(async (req, res) => {
  const matchdayFound = await Matchday.findById(req.params.id);
  const { current } = matchdayFound;
  const { id } = matchdayFound;
  if (!current) {
    res.status(400);
    throw new Error(`Matchday not current Matchday!`);
  }
  const managerLives = await ManagerLive.find({}).lean();
  const bulkOps = managerLives.map((lives) => {
    const { _id, livePicks } = lives;
    const mdPicks = livePicks.find((x) => x.matchday === id);
    const { picks, automaticSubs } = mdPicks;

    // Arrays of ids for players involved in autosubs
    const ins = automaticSubs.map((x) => x.in).map((x) => x._id.toString());
    const outs = automaticSubs.map((x) => x.out).map((x) => x._id.toString());

    // Mapping IN player's id to OUT player's object
    const inOutMap = new Map(
      automaticSubs.map((x) => [
        x.in._id.toString(),
        { ...x.out, slot: x.in.slot, multiplier: x.out.IsCaptain ? 2 : 1 },
      ])
    );
    // Mapping OUT player's id to IN player's object
    const outInMap = new Map(
      automaticSubs.map((x) => [
        x.out._id.toString(),
        { ...x.in, slot: x.out.slot, multiplier: 0 },
      ])
    );

    // Swapping auto subbed IN players back to the bench and reset captain if auto subbed OUT
    const newMdPicks = picks
      .map((pick) =>
        ins.includes(pick._id.toString())
          ? inOutMap.get(pick._id.toString())
          : outs.includes(pick._id.toString())
          ? outInMap.get(pick._id.toString())
          : pick
      )
      .map((x) => (x.IsViceCaptain ? { ...x, multiplier: 1 } : x));

    // Mapping picks with back into the array with empty automaticSubs array
    const oldMdPicks = livePicks.map((x) =>
      x.matchday === id ? { ...x, automaticSubs: [], picks: newMdPicks } : x
    );

    return {
      updateOne: {
        filter: { _id: _id },
        update: { $set: { livePicks: oldMdPicks } },
      },
    };
  });

  await ManagerLive.bulkWrite(bulkOps);
  const message = await setInitialPoints(req, res, req.params.id);
  res.json({ message: `Autosubs undone and ${message.message}.`  });
});

//@desc Delete Matchday
//@route DELETE /api/matchdays/:id
//@access Private
//@roles Admin
const deleteMatchday = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findById(req.params.id);

  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  }

  //FInd user
  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }

  await Matchday.findByIdAndDelete(req.params.id);
  res.status(200).json({ id: req.params.id });
});

export {
  createAutos,
  undoAutos,
  updateMDdata,
  getCurrentMD,
  getMaxMD,
  getMinMD,
  updateTOW,
  getTOW,
  getTOWs,
  endMatchday,
  setMatchday,
  getMatchdays,
  getMatchday,
  startMatchday,
  updateMatchday,
  deleteMatchday,
};
