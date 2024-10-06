import asyncHandler from "express-async-handler";
import Matchday from "../models/matchdayModel.js";
import ManagerLive from "../models/managerLive.js";
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
  const { id } = matchday;
  const prev = id > 1 ? id - 1 : 0;
  const next = id + 1;

  if (!matchday) {
    res.status(400);
    throw new Error("Matchday not found");
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
    const allLives = await ManagerLive.find({
      "livePicks.matchdayId": req.params.id,
    })
      .sort({"livePicks.matchdayPoints": -1})
      const highestPoints = Math.max(...allPlayers.map(x => x.totalPoints))
      const highestScoringEntry = allPlayers.find(x => x.totalPoints === highestPoints)
      const { player } = highestScoringEntry
    const livesArr = allLives.map(x => x.livePicks).flat()
    const highestScore = Math.max(...livesArr.map(x => x.matchdayPoints))
    const totalPts = livesArr.map(x => x.matchdayPoints).reduce((a,b) => a+b,0)
    const avergeScore = totalPts/allLives.length
  const updatedMatchday = await Matchday.findByIdAndUpdate(req.params.id, {$set: {
    highestScoringEntry: player, avergeScore, highestScore}})
  res.status(201).json(updatedMatchday)
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
    const updated = await Matchday.findByIdAndUpdate(
      req.params.id,
      { current: false, finished: true },
      { new: true }
    );

    res.status(200).json(updated);
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
