import asyncHandler from "express-async-handler";
import Matchday from "../models/matchdayModel.js";
import ManagerLive from "../models/managerLive.js";
import ManagerInfo from "../models/managerInfoModel.js";
import PlayerHistory from "../models/playerHistoryModel.js"
import Position from "../models/positionModel.js";
import TOW from "../models/teamOfTheWeekModel.js"
import User from "../models/userModel.js";
import mongoose from "mongoose";


//@desc Get recent matchday
//@route GET /api/matchdays/data/max/
//@access Public
const getMaxMD = asyncHandler(async (req, res) => {
  const matchdays = await Matchday.find({ pastDeadline: true })
  if (matchdays.length > 0) {
    const newMd = Math.max(...matchdays.map(x => x.id))
    console.log(newMd)
    res.status(200).json(newMd)
  } else {
    res.status(200).json(null)
  }

})

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
  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  }

  const { id, next: isNext } = matchday;
  const prev = id > 1 ? id - 1 : 0;
  const next = id + 1;

  if (!isNext) {
    res.status(400);
    throw new Error("Matchday is not the next one");
  }

  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let updatedMatchday, nextMatchdayDoc;

    if (prev === 0) {
      // First matchday case
      updatedMatchday = await Matchday.findByIdAndUpdate(
        req.params.id,
        { next: false, current: true, pastDeadline: true },
        { new: true, session }
      );

      nextMatchdayDoc = await Matchday.findOneAndUpdate(
        { id: next },
        { next: true },
        { new: true, session }
      );
    } else {
      const prevMatchday = await Matchday.findOne({ id: prev }).session(session);
      const nextMatchday = await Matchday.findOne({ id: next }).session(session);

      if (!prevMatchday.finished || !prevMatchday.pastDeadline) {
        throw new Error(`Previous matchday isn't finished yet!`);
      }

      updatedMatchday = await Matchday.findByIdAndUpdate(
        req.params.id,
        { next: false, current: true, pastDeadline: true },
        { new: true, session }
      );

      if (nextMatchday) {
        nextMatchdayDoc = await Matchday.findByIdAndUpdate(
          nextMatchday._id,
          { next: true },
          { new: true, session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      currentMatchday: updatedMatchday,
      nextMatchday: nextMatchdayDoc || null,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const matchdayFound = await Matchday.findById(req.params.id).session(session);
    if (!matchdayFound) {
      throw new Error('Matchday not found!');
    }

    // Uncomment to restrict update to current matchday
     if (!matchdayFound.current) {
       throw new Error('Matchday is not the current one!');
     }

    const allPlayers = await PlayerHistory.find({ matchday: req.params.id }).session(session);
    if (allPlayers.length === 0) {
      throw new Error('No players in this matchday yet!');
    }

    const allLives = await ManagerLive.find().session(session);

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
          matchdayRank: null,
        };
      }

      return {
        manager: x.manager,
        matchday: pick.matchday,
        matchdayId: pick.matchdayId,
        matchdayPoints: pick.matchdayPoints ?? 0,
        matchdayRank: pick.matchdayRank ?? null,
      };
    });

    const validScores = entriesWithScore.filter((x) => typeof (x.matchdayPoints) === 'number') ?? [];
    const highestScore = Math.max(...validScores.map((x) => x.matchdayPoints)) ?? 0;
    const totalPoints = validScores.reduce((sum, x) => sum + x.matchdayPoints, 0) ?? 0;
    const averageScore = Math.round(totalPoints / allLives.length) ?? 0;
    const highestScoringEntry = validScores.find((x) => x.matchdayPoints === highestScore)?.manager || null;

    const highestPlayerPoints = Math.max(...allPlayers.map((p) => p.totalPoints)) ?? 0;
    const topPlayer = allPlayers.find((p) => p.totalPoints === highestPlayerPoints)?.player || null;

    const updatedMatchday = await Matchday.findByIdAndUpdate(
      req.params.id,
      {
        highestScoringEntry,
        topPlayer,
        avergeScore: averageScore,
        highestScore,
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(updatedMatchday);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message || 'Something went wrong' });
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
    throw new Error('Matchday not found!');
  }

  const { id } = matchdayFound;

  // Dynamically load position mappings
  const positions = await Position.find();
  const posObj = {}, codeObj = {};
  positions.forEach(pos => {
    posObj[pos._id.toString()] = pos.shortName;
    codeObj[pos._id.toString()] = pos.code;
  });

  const playerHistories = await PlayerHistory.find({ matchday: req.params.id }).populate('player');
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
    .map(x => {
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
    { GKP: 1, DEF: 4, MID: 5, FWD: 1 }
  ];

  let bestTeam = null, bestScore = -1, bestFormation = null;

  for (const formation of formations) {
    let team = [];
    let valid = true;
    let total = 0;

    for (const pos of ['GKP', 'DEF', 'MID', 'FWD']) {
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
          starOnes: bestTeam
        }
      },
      { new: true }
    );
    res.status(200).json(updated);
  } else {
    const created = await TOW.create({
      matchday: id,
      matchdayId: req.params.id,
      starOnes: bestTeam
    });
    res.status(201).json(created);
  }

  // Build Team of the Week
  /*const starOnes = [];
  let goal = 0, def = 0, mid = 0, fwd = 0, total = 0;

  
  for (const p of sortedPlayers) {
    if (total === 11) break;

    switch (p.position) {
      case 'GKP':
        if (goal < 1) {
          starOnes.push(p); goal++; total++;
        }
        break;
      case 'DEF':
        if ((def === 4 && mid === 5) || (def === 3 && mid === 4 && fwd === 3)) break;
        if (def < 5) {
          starOnes.push(p); def++; total++;
        }
        break;
      case 'MID':
        if ((mid === 4 && def === 2) || (mid === 4 && fwd === 3) || (mid === 4 && def === 5)) break;
        if (mid < 5) {
          starOnes.push(p); mid++; total++;
        }
        break;
      case 'FWD':
        if (fwd === 2 && mid === 5) break;
        if (fwd < 3) {
          starOnes.push(p); fwd++; total++;
        }
        break;
    }
  }

  // Upsert TOW document
  const update = {
    matchday: id,
    matchdayId: req.params.id,
    starOnes
  };

  const realStars = await TOW.findOneAndUpdate(
    { matchdayId: req.params.id },
    { $set: update },
    { upsert: true, new: true }
  );

  res.status(201).json(realStars);*/
});


//@desc Get Team of the week
//@route GET /api/matchdays/data/tows/:id
//@access Public
//@role Admin, editor, Normal User
const getTOW = asyncHandler(async (req, res) => {
  const tow = await TOW.findOne({ matchdayId: req.params.id })
  if (!tow) {
    res.status(404)
    throw new Error('No team of the week found')
  }
  res.status(200).json(tow)
})

//@route GET /api/matchdays/data/tows/
//@access Public
//@role Admin, editor, Normal User
const getTOWs = asyncHandler(async (req, res) => {
  const tows = await TOW.find({})
  if (!tows) {
    res.status(404)
    throw new Error('No team of the week found')
  }
  res.status(200).json(tows)
})

//@desc End Matchday
//@route PUT /api/matchdays/endmatchday/:id
//@access Private
//@role Admin, editor
const endMatchday = asyncHandler(async (req, res) => {
  const matchdayFound = await Matchday.findById(req.params.id);
  const { current } = matchdayFound
  const { id } = matchdayFound;
  const prev = id > 1 ? id - 1 : 0;
  const next = id + 1;
  console.log(matchdayFound)
  if (!current) {
    res.status(400)
    throw new Error(`Matchday not current Matchday!`)
  }

  if (prev === 0) {
    const updated = await Matchday.findByIdAndUpdate(
      req.params.id,
      { current: false, finished: true },
      { new: true }
    );

    res.status(200).json(updated);
  } else {
    const prevMatchday = await Matchday.findOne({ id: prev });
    const nextMatchday = await Matchday.findOne({ id: next });
    const { finished, pastDeadline } = prevMatchday;
    let nextMatch;

    if (finished === false || pastDeadline === false) {
      res.status(400);
      throw new Error(`Previous matchday isn't finished yet!`);
    }
    const updated = await Matchday.findByIdAndUpdate(
      req.params.id,
      { current: false, finished: true },
      { new: true }
    );

    res.status(200).json(updated);
  }
});

//@desc Create autosubs
//@route PATCH /api/matchdays/createautos/:id
//@access Private
//@role Admin, editor
const createAutos = asyncHandler(async (req, res) => {
  const matchdayFound = await Matchday.findById(req.params.id);
  const { current } = matchdayFound
  const { id } = matchdayFound;
  /* if (!current) {
     res.status(400)
     throw new Error(`Matchday not current Matchday!`)
   }*/
  const managerLives = await ManagerLive.find({})
  for (let i = 0; i < managerLives.length; i++) {
    const { manager, livePicks: lively } = managerLives[i]
    const mdPicks = lively.find(x => x.matchday === id)
    const manInfo = await ManagerInfo.findById(manager)
    console.log(manInfo.teamName)
    const {
      matchday,
      matchdayId,
      activeChip,
      matchdayRank,
      teamValue,
      automaticSubs,
      bank,
      picks: unformattedPicks,
    } = mdPicks;
    //Captain missed
    const captainMissed = unformattedPicks.find(x => x.multiplier > 1 && +x.starts === 0 && +x.bench === 0)
    //Available players
    let available = unformattedPicks.filter(x => x.multiplier === 0 && x.slot > 12 && (+x.starts > 0 || +x.bench > 0))
    let availableGoalie = unformattedPicks.filter(x => (+x.starts > 0 || +x.bench > 0) && x.slot === 12)
    //Available by position
    let availableDefs = available.filter(x => x.playerPosition.toString() === '669a4831e181cb2ed40c240f')
    let availableFwds = available.filter(x => x.playerPosition.toString() === '669a485de181cb2ed40c2417')
    let availableMids = available.filter(x => x.playerPosition.toString() === '669a4846e181cb2ed40c2413')
    const gWhoMissed = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a41e50f8891d8e0b4eb2a' && +x.starts === 0 && +x.bench === 0)
    const dWhoMissed = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a4831e181cb2ed40c240f' && +x.starts === 0 && +x.bench === 0)
    const mWhoMissed = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a4846e181cb2ed40c2413' && +x.starts === 0 && +x.bench === 0)
    const fWhoMissed = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a485de181cb2ed40c2417' && +x.starts === 0 && +x.bench === 0)

    //Starting players by position
    let startingDefs = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a4831e181cb2ed40c240f')
    let startingFwds = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a485de181cb2ed40c2417')
    let startingMids = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a4846e181cb2ed40c2413')

    //console.log(available.length)
    if (captainMissed) {
      const vice = unformattedPicks.find(x => x.IsViceCaptain === true)
      const { _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: pm, nowCost: pn,
        IsCaptain: pc, IsViceCaptain: pvc, slot: ps, points: ppts } = captainMissed
      const { _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: mm, nowCost: mn,
        IsCaptain: mc, IsViceCaptain: mvc, slot: ms, points: mpts } = vice
      const cMissedIndex = unformattedPicks.findIndex(x => x.IsCaptain === captainMissed.IsCaptain)
      const newCaptain = {
        _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: 1, nowCost: pn,
        IsCaptain: pc, IsViceCaptain: pvc, slot: ps, points: ppts
      }
      const newVice = {
        _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: pm, nowCost: mn,
        IsCaptain: mc, IsViceCaptain: mvc, slot: ms, points: mpts * pm
      }
      unformattedPicks.splice(cMissedIndex, 1, newCaptain)
      const pIndex = unformattedPicks.findIndex(x => x.IsViceCaptain === vice.IsViceCaptain)
      unformattedPicks.splice(pIndex, 1, newVice)
    }
    if (gWhoMissed.length > 0 && availableGoalie.length > 0) {
      const potential = availableGoalie.find(x => +x.starts > 0 || +x.bench > 0)
      const { _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: pm, nowCost: pn,
        IsCaptain: pc, IsViceCaptain: pvc, slot: ps, points: ppts } = potential
      const { _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: mm, nowCost: mn,
        IsCaptain: mc, IsViceCaptain: mvc, slot: ms, points: mpts } = gWhoMissed[0]
      const mMissedIndex = unformattedPicks.findIndex(x => x.slot === gWhoMissed[0].slot)
      const newPotential = {
        _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: 1, nowCost: pn,
        IsCaptain: pc, IsViceCaptain: pvc, slot: ms, points: ppts
      }
      const oldMid = {
        _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: pm, nowCost: mn,
        IsCaptain: mc, IsViceCaptain: mvc, slot: ps, points: mpts
      }
      unformattedPicks.splice(mMissedIndex, 1, oldMid)
      const pIndex = unformattedPicks.findIndex(x => x.slot === potential.slot)
      unformattedPicks.splice(pIndex, 1, newPotential)
      automaticSubs.push({ in: { _id: p_id, playerPosition: pp, playerTeam: pt }, out: { _id: m_id, playerPosition: mp, playerTeam: mt } })

    }
    if (dWhoMissed.length > 0) {
      for (let i = 0; i < dWhoMissed.length; i++) {
        available.sort((a, b) => a.slot > b.slot ? 1 : -1)
        if (available.length === 0) break;
        if (startingDefs.length === 3 && availableDefs.length === 0) break;
        const potential = available.find(x => +x.starts > 0 || +x.bench > 0)
        const { _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: pm, nowCost: pn,
          IsCaptain: pc, IsViceCaptain: pvc, slot: ps, points: ppts } = potential
        const { _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: mm, nowCost: mn,
          IsCaptain: mc, IsViceCaptain: mvc, slot: ms, points: mpts } = dWhoMissed[i]

        const mMissedIndex = unformattedPicks.findIndex(x => x.slot === ms)
        const newPotential = {
          _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: 1, nowCost: pn,
          IsCaptain: pc, IsViceCaptain: pvc, slot: ms, points: ppts
        }
        const oldMid = {
          _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: pm, nowCost: mn,
          IsCaptain: mc, IsViceCaptain: mvc, slot: ps, points: mpts
        }
        unformattedPicks.splice(mMissedIndex, 1, newPotential)
        const pIndex = unformattedPicks.findIndex(x => x.slot === ps)
        unformattedPicks.splice(pIndex, 1, oldMid)
        //Defenders
        if (pp.toString() === '669a4831e181cb2ed40c240f') {
          /*availableDefs -= 1
          startingDefs += 1*/
          const availDefIndex = availableDefs.findIndex(x => x._id === potential._id)
          availableDefs.splice(availDefIndex, 1)
          const starDefIndex = startingDefs.findIndex(x => x._id === dWhoMissed[i]._id)
          startingDefs.splice(starDefIndex, 1, newPotential)
        }
        //Forwards
        if (pp.toString() === '669a485de181cb2ed40c2417' && startingDefs.length > 3) {
          /*availableFwds -= 1
          startingFwds += 1*/
          const availFwdIndex = availableFwds.findIndex(x => x._id === potential._id)
          availableFwds.splice(availFwdIndex, 1)
          const starDefIndex = startingDefs.findIndex(x => x._id === dWhoMissed[i]._id)
          startingDefs.splice(starDefIndex, 1)
          startingFwds.push(newPotential)
        }
        //Midfielders
        if (pp.toString() === '669a4846e181cb2ed40c2413' && startingDefs.length > 3) {
          const availMidIndex = availableMids.findIndex(x => x._id === potential._id)
          availableMids.splice(availMidIndex, 1)
          const starDefIndex = startingDefs.findIndex(x => x._id === dWhoMissed[i]._id)
          startingDefs.splice(starDefIndex, 1)
          startingMids.push(newPotential)
        }
        const availableIndex = available.findIndex(x => x._id === potential._id)
        automaticSubs.push({ in: { _id: p_id, playerPosition: pp, playerTeam: pt }, out: { _id: m_id, playerPosition: mp, playerTeam: mt } })
        available.splice(availableIndex, 1)
      }

    }
    if (mWhoMissed.length > 0) {
      for (let i = 0; i < mWhoMissed.length; i++) {
        available.sort((a, b) => a.slot > b.slot ? 1 : -1)
        if (available.length === 0) break;
        const potential = available.find(x => +x.starts > 0 || +x.bench > 0)
        const { _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: pm, nowCost: pn,
          IsCaptain: pc, IsViceCaptain: pvc, slot: ps, points: ppts } = potential
        const { _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: mm, nowCost: mn,
          IsCaptain: mc, IsViceCaptain: mvc, slot: ms, points: mpts } = mWhoMissed[i]
        const mMissedIndex = unformattedPicks.findIndex(x => x.slot === ms)
        const newPotential = {
          _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: 1, nowCost: pn,
          IsCaptain: pc, IsViceCaptain: pvc, slot: ms, points: ppts
        }
        const oldMid = {
          _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: pm, nowCost: mn,
          IsCaptain: mc, IsViceCaptain: mvc, slot: ps, points: mpts
        }
        unformattedPicks.splice(mMissedIndex, 1, newPotential)
        const pIndex = unformattedPicks.findIndex(x => x.slot === ps)
        unformattedPicks.splice(pIndex, 1, oldMid)
        //Defenders
        if (pp.toString() === '669a4831e181cb2ed40c240f') {
          const availDefIndex = availableDefs.findIndex(x => x._id === potential._id)
          availableDefs.splice(availDefIndex, 1)
          const starMidIndex = startingMids.findIndex(x => x._id === mWhoMissed[i]._id)
          startingMids.splice(starMidIndex, 1)
          startingDefs.push(newPotential)
        }
        //Forwards
        if (pp.toString() === '669a485de181cb2ed40c2417') {
          const availFwdIndex = availableFwds.findIndex(x => x._id === potential._id)
          availableFwds.splice(availFwdIndex, 1)
          const starMidIndex = startingMids.findIndex(x => x._id === mWhoMissed[i]._id)
          startingMids.splice(starMidIndex, 1)
          startingFwds.push(newPotential)
        }
        //Midfielders
        if (pp.toString() === '669a4846e181cb2ed40c2413') {
          const availMidIndex = availableMids.findIndex(x => x._id === potential._id)
          availableMids.splice(availMidIndex, 1)
          const starMidIndex = startingMids.findIndex(x => x._id === mWhoMissed[i]._id)
          startingMids.splice(starMidIndex, 1, newPotential)
        }
        const availableIndex = available.findIndex(x => x._id === potential._id)
        automaticSubs.push({ in: { _id: p_id, playerPosition: pp, playerTeam: pt }, out: { _id: m_id, playerPosition: mp, playerTeam: mt } })
        available.splice(availableIndex, 1)
      }
    }
    if (fWhoMissed.length > 0) {
      for (let i = 0; i < fWhoMissed.length; i++) {
        if (available.length === 0) break;
        if (startingFwds.length === 1 && availableFwds.length === 0) break;
        const potential = available.find(x => +x.starts > 0 || +x.bench > 0)
        const { _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: pm, nowCost: pn,
          IsCaptain: pc, IsViceCaptain: pvc, slot: ps, points: ppts } = potential
        const { _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: mm, nowCost: mn,
          IsCaptain: mc, IsViceCaptain: mvc, slot: ms, points: mpts } = fWhoMissed[i]
        const mMissedIndex = unformattedPicks.findIndex(x => x.slot === ms)
        const newPotential = {
          _id: p_id, playerPosition: pp, playerTeam: pt, multiplier: 1, nowCost: pn,
          IsCaptain: pc, IsViceCaptain: pvc, slot: ms, points: ppts
        }
        const oldMid = {
          _id: m_id, playerPosition: mp, playerTeam: mt, multiplier: pm, nowCost: mn,
          IsCaptain: mc, IsViceCaptain: mvc, slot: ps, points: mpts
        }
        unformattedPicks.splice(mMissedIndex, 1, newPotential)
        const pIndex = unformattedPicks.findIndex(x => x.slot === ps)
        unformattedPicks.splice(pIndex, 1, oldMid)
        //Defenders
        if (pp.toString() === '669a4831e181cb2ed40c240f' && startingFwds.length > 1) {
          const availDefIndex = availableDefs.findIndex(x => x._id === potential._id)
          availableDefs.splice(availDefIndex, 1)
          const starFwdIndex = startingFwds.findIndex(x => x._id === fWhoMissed[i]._id)
          startingFwds.splice(starFwdIndex, 1)
          startingFwds.push(newPotential)

        }
        if (pp.toString() === '669a485de181cb2ed40c2417') {
          const availFwdIndex = availableFwds.findIndex(x => x._id === potential._id)
          availableFwds.splice(availFwdIndex, 1)
          const starFwdIndex = startingFwds.findIndex(x => x._id === fWhoMissed[i]._id)
          startingFwds.splice(starFwdIndex, 1, newPotential)
        }
        //midfielders
        if (pp.toString() === '669a4846e181cb2ed40c2413' && startingFwds.length > 1) {
          const availMidIndex = availableMids.findIndex(x => x._id === potential._id)
          availableMids.splice(availMidIndex, 1)
          const starFwdIndex = startingFwds.findIndex(x => x._id === fWhoMissed[i]._id)
          startingFwds.splice(starFwdIndex, 1)
          startingFwds.push(newPotential)
        }
        const availableIndex = available.findIndex(x => x._id === potential._id)
        automaticSubs.push({ in: { _id: p_id, playerPosition: pp, playerTeam: pt }, out: { _id: m_id, playerPosition: mp, playerTeam: mt } })
        available.splice(availableIndex, 1)
      }

    }
    //console.log(automaticSubs)

    const newMdPoints = unformattedPicks
      .filter((x) => x.multiplier > 0)
      .reduce((x, y) => x + y.points, 0);
    const newFormatted = {
      picks: unformattedPicks,
      matchday,
      matchdayId,
      activeChip,
      teamValue,
      bank,
      matchdayRank,
      automaticSubs,
      matchdayPoints: newMdPoints,
    };

    const superLives = lively.filter(
      (x) => x.matchdayId.toString() !== req.params.id.toString()
    );
    superLives.push(newFormatted);
    const managerinfo = await ManagerInfo.findOneAndUpdate(
      { _id: manager },
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
      { manager: manager },
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
      .filter((x) => x.matchday >= startTeamMd.id && x.matchday <= endTeamMdId)
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

  res.status(201).json('Update Complete')
})

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
  updateMDdata,
  getMaxMD,
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
