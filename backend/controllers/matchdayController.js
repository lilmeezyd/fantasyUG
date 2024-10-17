import asyncHandler from "express-async-handler";
import Matchday from "../models/matchdayModel.js";
import ManagerLive from "../models/managerLive.js";
import ManagerInfo from "../models/managerInfoModel.js";
import PlayerHistory from "../models/playerHistoryModel.js"
import User from "../models/userModel.js";

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
  const { id, next: isNext } = matchday;
  const prev = id > 1 ? id - 1 : 0;
  const next = id + 1;

  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
  }

  if(!isNext) {
    res.status(400);
    throw new Error("Matchday not the next one");
  }

  //FInd user
  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }

  if (prev === 0) {
    const updated = await Matchday.findByIdAndUpdate(
      req.params.id,
      { next: false, current: true, pastDeadline: true },
      { new: true }
    );

    await Matchday.findOneAndUpdate(
      { id: next },
      { next: true },
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
      { next: false, current: true, pastDeadline: true },
      { new: true }
    );

    if (nextMatchday) {
      nextMatch = nextMatchday?._id;

      await Matchday.findByIdAndUpdate(
        nextMatch,
        { next: true },
        { new: true }
      );
    }

    res.status(200).json(updated);
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
  const matchdayFound = await Matchday.findById(req.params.id);
  const { current } = matchdayFound
  if(!current) {
    res.status(400)
    throw new Error(`Matchday not current Matchday!`)
  }
  const allPlayers = await PlayerHistory.find({matchday: req.params.id})
    const allLives = await ManagerLive.find()
    const entriesWithScore = allLives.map(x => {
      const y = x.livePicks.find(
        (x) => x.matchdayId.toString() === req.params.id.toString()
      )
      const {matchday, matchdayId, matchdayPoints, matchdayRank} = y
      return {manager: x.manager, matchday, matchdayId, matchdayPoints, matchdayRank}
    })
    const highestScore = Math.max(...entriesWithScore.map(x => x.matchdayPoints))
    const totalPts = entriesWithScore.map(x => x.matchdayPoints).reduce((a,b) => a+b,0)
    const avergeScore = (+(totalPts/allLives.length).toFixed(0))
    const highestScoringEntry = entriesWithScore.find(x => x.matchdayPoints === highestScore).manager
    if(allPlayers.length > 0) {
      const highestPoints = Math.max(...allPlayers.map(x => x.totalPoints))
      const topPlayer = allPlayers.find(x => x.totalPoints === highestPoints)
      const { player } = topPlayer
  const updatedMatchday = await Matchday.findByIdAndUpdate(req.params.id, {$set: {
    highestScoringEntry, topPlayer: player, avergeScore, highestScore}})
  res.status(201).json(updatedMatchday)
    }
});

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
  if(!current) {
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
    const managerLives = await ManagerLive.find({})
    for(let i=0; i<managerLives.length; i++) {
      const { manager, livePicks: lively } = managerLives[i]
      const mdPicks = lively.find(x => x.matchday === id)
      const {
        matchday,
        matchdayId,
        activeChip,
        matchdayRank,
        teamValue,
        bank,
        picks: unformattedPicks,
      } = mdPicks;
      //Captain missed
      const captainMissed = unformattedPicks.find(x => x.multiplier > 1 && +x.points === 0)
      //Available players
      let available = unformattedPicks.filter(x => x.multiplier === 0 && x.slot > 12 && +x.points > 0)
      let availableGoalie = unformattedPicks.filter(x => +x.points > 0 && x.slot === 12)
      //Available by position
      let availableDefs = available.filter(x => x.playerPosition.toString() === '669a4831e181cb2ed40c240f')
      let availableFwds = available.filter(x => x.playerPosition.toString() === '669a485de181cb2ed40c2417')
      const gWhoMissed = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a41e50f8891d8e0b4eb2a' && +x.points === 0)
      const dWhoMissed = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a4831e181cb2ed40c240f' && +x.points === 0)
      const mWhoMissed = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a4846e181cb2ed40c2413' && +x.points === 0)
      const fWhoMissed = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a485de181cb2ed40c2417' && +x.points === 0)
      
      //Starting players by position
      let startingDefs = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a4831e181cb2ed40c240f')
      let startingFwds = unformattedPicks.filter(x => x.multiplier > 0 && x.playerPosition.toString() === '669a485de181cb2ed40c2417')
     const automaticSubs = []
      if(captainMissed) {
        const vice = unformattedPicks.find(x => x.IsViceCaptain === true)
        const { _id:p_id, playerPosition:pp, playerTeam:pt, multiplier:pm, nowCost:pn,
          IsCaptain:pc, IsViceCaptain:pvc, slot:ps, points:ppts } = captainMissed
          const { _id:m_id, playerPosition:mp, playerTeam:mt, multiplier:mm, nowCost:mn,
           IsCaptain:mc, IsViceCaptain:mvc, slot:ms, points:mpts } = vice
           const cMissedIndex = unformattedPicks.findIndex(x => x.IsCaptain === captainMissed.IsCaptain)
          const newCaptain = {_id:p_id, playerPosition:pp, playerTeam:pt, multiplier:1, nowCost:pn,
            IsCaptain:pc, IsViceCaptain:pvc, slot:ps, points:ppts}
          const newVice = {_id:m_id, playerPosition:mp, playerTeam:mt, multiplier:pm, nowCost:mn,
            IsCaptain:mc, IsViceCaptain:mvc, slot:ms, points:mpts*pm}
          unformattedPicks.splice(cMissedIndex,1,newCaptain)
          const pIndex = unformattedPicks.findIndex(x => x.IsViceCaptain === vice.IsViceCaptain)
          unformattedPicks.splice(pIndex,1,newVice)
      }
      if(gWhoMissed.length > 0) {
        const potential = availableGoalie.find(x => +x.points > 0)
        const { _id:p_id, playerPosition:pp, playerTeam:pt, multiplier:pm, nowCost:pn,
          IsCaptain:pc, IsViceCaptain:pvc, slot:ps, points:ppts } = potential
          const { _id:m_id, playerPosition:mp, playerTeam:mt, multiplier:mm, nowCost:mn,
           IsCaptain:mc, IsViceCaptain:mvc, slot:ms, points:mpts } = gWhoMissed[0]
       const mMissedIndex = unformattedPicks.findIndex(x => x.slot === gWhoMissed[0].slot)
       const newPotential = {_id:p_id, playerPosition:pp, playerTeam:pt, multiplier:1, nowCost:pn,
         IsCaptain:pc, IsViceCaptain:pvc, slot:ms, points:ppts}
       const oldMid = {_id:m_id, playerPosition:mp, playerTeam:mt, multiplier:pm, nowCost:mn,
         IsCaptain:mc, IsViceCaptain:mvc, slot:ps, points:mpts}
       unformattedPicks.splice(mMissedIndex,1,oldMid)
       const pIndex = unformattedPicks.findIndex(x => x.slot === potential.slot)
       unformattedPicks.splice(pIndex,1,newPotential)
       automaticSubs.push({in:{_id:p_id, playerPosition:pp, playerTeam:pt},out:{_id:m_id, playerPosition:mp, playerTeam:mt}})

      }
      if(dWhoMissed.length > 0) {
        for(let i=0; i < dWhoMissed.length; i++) {
          available.sort((a,b) => a.slot > b.slot ? 1 : -1)
          if(available.length === 0) break;
          if(startingDefs.length === 3 && availableDefs.length === 0) break;
          const potential = available.find(x => +x.points > 0)
          const { _id:p_id, playerPosition:pp, playerTeam:pt, multiplier:pm, nowCost:pn,
             IsCaptain:pc, IsViceCaptain:pvc, slot:ps, points:ppts } = potential
             const { _id:m_id, playerPosition:mp, playerTeam:mt, multiplier:mm, nowCost:mn,
              IsCaptain:mc, IsViceCaptain:mvc, slot:ms, points:mpts } = dWhoMissed[i]
              
          const mMissedIndex = unformattedPicks.findIndex(x => x.slot === ms)
          const newPotential = {_id:p_id, playerPosition:pp, playerTeam:pt, multiplier:1, nowCost:pn,
            IsCaptain:pc, IsViceCaptain:pvc, slot:ms, points:ppts}
          const oldMid = {_id:m_id, playerPosition:mp, playerTeam:mt, multiplier:pm, nowCost:mn,
            IsCaptain:mc, IsViceCaptain:mvc, slot:ps, points:mpts}
          unformattedPicks.splice(mMissedIndex,1,newPotential)
          const pIndex = unformattedPicks.findIndex(x => x.slot === ps)
          unformattedPicks.splice(pIndex,1,oldMid)
          if(pp.toString() === '669a4831e181cb2ed40c240f') {
            availableDefs-=1
            startingDefs+=1
          }
          if(pp.toString() === '669a485de181cb2ed40c2417') {
            availableFwds-=1
            startingFwds+=1
          }
          if(pp.toString() !== '669a4831e181cb2ed40c240f' && mp.toString() === '669a4831e181cb2ed40c240f') {
            startingDefs-=1
          }
          const availableIndex = available.findIndex(x => x._id === potential._id)
          automaticSubs.push({in:{_id:p_id, playerPosition:pp, playerTeam:pt},out:{_id:m_id, playerPosition:mp, playerTeam:mt}})
          available.splice(availableIndex,1)
        }

      }
      if(mWhoMissed.length > 0) {
        for(let i=0; i < mWhoMissed.length; i++) {
          available.sort((a,b) => a.slot > b.slot ? 1 : -1)
          if(available.length === 0) break;
          const potential = available.find(x => +x.points > 0)
          const { _id:p_id, playerPosition:pp, playerTeam:pt, multiplier:pm, nowCost:pn,
             IsCaptain:pc, IsViceCaptain:pvc, slot:ps, points:ppts } = potential
             const { _id:m_id, playerPosition:mp, playerTeam:mt, multiplier:mm, nowCost:mn,
              IsCaptain:mc, IsViceCaptain:mvc, slot:ms, points:mpts } = mWhoMissed[i]
          const mMissedIndex = unformattedPicks.findIndex(x => x.slot === ms)
          const newPotential = {_id:p_id, playerPosition:pp, playerTeam:pt, multiplier:1, nowCost:pn,
            IsCaptain:pc, IsViceCaptain:pvc, slot:ms, points:ppts}
          const oldMid = {_id:m_id, playerPosition:mp, playerTeam:mt, multiplier:pm, nowCost:mn,
            IsCaptain:mc, IsViceCaptain:mvc, slot:ps, points:mpts}
          unformattedPicks.splice(mMissedIndex,1,newPotential)
          const pIndex = unformattedPicks.findIndex(x => x.slot === ps)
          unformattedPicks.splice(pIndex,1,oldMid)
          if(pp.toString() === '669a4831e181cb2ed40c240f') {
            availableDefs-=1
            startingDefs+=1
          }
          if(pp.toString() === '669a485de181cb2ed40c2417') {
            availableFwds-=1
            startingFwds+=1
          }
          const availableIndex = available.findIndex(x => x._id === potential._id)
          automaticSubs.push({in:{_id:p_id, playerPosition:pp, playerTeam:pt},out:{_id:m_id, playerPosition:mp, playerTeam:mt}})
          available.splice(availableIndex,1)
        }
      }
      if(fWhoMissed.length > 0) {
        for(let i=0; i < fWhoMissed.length; i++) {
          if(available.length === 0) break;
          if(startingFwds.length === 1 && availableFwds.length === 0) break;
          const potential = available.find(x => +x.points > 0)
          const { _id:p_id, playerPosition:pp, playerTeam:pt, multiplier:pm, nowCost:pn,
             IsCaptain:pc, IsViceCaptain:pvc, slot:ps, points:ppts } = potential
             const { _id:m_id, playerPosition:mp, playerTeam:mt, multiplier:mm, nowCost:mn,
              IsCaptain:mc, IsViceCaptain:mvc, slot:ms, points:mpts } = fWhoMissed[i]
          const mMissedIndex = unformattedPicks.findIndex(x => x.slot === ms)
          const newPotential = {_id:p_id, playerPosition:pp, playerTeam:pt, multiplier:1, nowCost:pn,
            IsCaptain:pc, IsViceCaptain:pvc, slot:ms, points:ppts}
          const oldMid = {_id:m_id, playerPosition:mp, playerTeam:mt, multiplier:pm, nowCost:mn,
            IsCaptain:mc, IsViceCaptain:mvc, slot:ps, points:mpts}
          unformattedPicks.splice(mMissedIndex,1,newPotential)
          const pIndex = unformattedPicks.findIndex(x => x.slot === ps)
          unformattedPicks.splice(pIndex,1,oldMid)
          if(pp.toString() === '669a4831e181cb2ed40c240f') {
            availableDefs-=1
            startingDefs+=1
          }
          if(pp.toString() === '669a485de181cb2ed40c2417') {
            availableFwds-=1
            startingFwds+=1
          }
          if(pp.toString() !== '669a485de181cb2ed40c2417' && mp.toString() === '669a485de181cb2ed40c2417') {
            startingFwds-=1
          }
          const availableIndex = available.findIndex(x => x._id === potential._id)
          automaticSubs.push({in:{_id:p_id, playerPosition:pp, playerTeam:pt},out:{_id:m_id, playerPosition:mp, playerTeam:mt}})
          available.splice(availableIndex,1)
        }
        
      }
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
    /*const updated = await Matchday.findByIdAndUpdate(
      req.params.id,
      { current: false, finished: true },
      { new: true }
    );

    res.status(200).json(updated);*/
  }
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
  updateMDdata,
  endMatchday,
  setMatchday,
  getMatchdays,
  getMatchday,
  startMatchday,
  updateMatchday,
  deleteMatchday,
};
