import asyncHandler from "express-async-handler";
import League from "../models/leagueModel.js";
import OverallLeague from "../models/overallLeagueModel.js";
import TeamLeague from "../models/teamLeagueModel.js";
import User from "../models/userModel.js";
import ManagerInfo from "../models/managerInfoModel.js";

//@desc Set League
//@route POST /api/leagues/privateleagues
//@access Private
const setLeague = asyncHandler(async (req, res) => {
  const { name, startMatchday, endMatchday } = req.body;
  if (!name || !startMatchday || !endMatchday) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  //Create entry code

  const league = await League.create({
    name,
    startMatchday,
    endMatchday,
    creator: req.user,
    entrants: [],
    entryCode
  });

  res.status(200).json(league);
});

//@desc Set overall League
//@toute POST /api/leagues/overallleagues
//@access Private
//@role ADMIN
const setOverallLeague = asyncHandler(async (req, res) => {
  const { name, startMatchday, endMatchday } = req.body;
  if (!name || !startMatchday || !endMatchday) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const league = await OverallLeague.create({
    name,
    startMatchday,
    endMatchday,
    creator: req.user,
    entrants: []
  });

  res.status(200).json(league);
})

//@desc Set team League 
//@toute POST /api/leagues/teamleagues
//@access Private
//@role ADMIN
const setTeamLeague = asyncHandler(async (req, res) => {
  const { team, startMatchday, endMatchday } = req.body;
  if (!team || !startMatchday || !endMatchday) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const league = await TeamLeague.create({
    team,
    startMatchday,
    endMatchday,
    creator: req.user,
    entrants: []
  });

  res.status(200).json(league);
})

//@desc Add to team league
//@route PUT /api/leagues/:id
//@access Private
const addToLeague = asyncHandler(async (req, res) => {
  const leagueAdmin = await League.findById(req.params.id).admin;
  const roles = await User.findById(leagueAdmin).roles;
  const managerInfo = await ManagerInfo.findOne({ user: req.user.id });
  const mgrId = managerInfo._id;
  const oldLeagues = managerInfo.leagues;
  const oldLeaguesIds = oldLeagues.map((x) => x.id);
  const requiredLeague = await League.findById(req.params.id);
  const oldEntrants = requiredLeague.entrants;
  const entrants = [...oldEntrants, mgrId];
  const { admin, name, id, startMatchday, endMatchday } = requiredLeague;

  if (oldLeaguesIds.includes(id)) {
    res.status(400);
    throw new Error("Already in the league");
  }

  //Find user
  if (!req.user) {
    res.status(400);
    throw new Error("User not found");
  }
  if (Object.values(req.user.roles).includes(2048)) {
    res.status(401);
    throw new Error("Unauthorized operation");
  }
  if (!Object.values(req.user.roles).includes(2048)) {
  }

  const newLeague = {
    admin,
    name,
    id,
    startMatchday,
    endMatchday,
    lastRank: null,
    currentRank: null,
    matchdayPoints: 0,
    overallPoints: 0,
  };

  const leagues = [...oldLeagues, newLeague];

  await ManagerInfo.findOneAndUpdate(
    { user: req.user.id },
    { leagues: leagues },
    { new: true }
  );

  const league = await League.findByIdAndUpdate(
    req.params.id,
    { entrants: entrants },
    {
      new: true,
    }
  );

  res.status(200).json(league);
});

//@desc Get default leagues 
//@route GET /api/leagues/teamleagues
//@access Public
const getTeamLeagues = asyncHandler(async (req, res) => {
  const leagues = await TeamLeague.find({}).populate("team");
  res.status(200).json(leagues);
}); 

//@desc Get default leagues
//@route GET /api/leagues/overallleagues
//@access Public
const getOverallLeagues = asyncHandler(async (req, res) => {
  const league = await OverallLeague.find({});
  res.status(200).json(league);
});

//@desc Get Leagues for a specific user
//@route GET /api/leagues/users/:id
//@access Private
const getLeagues = asyncHandler(async (req, res) => {
  /*const user = await User.findById(req.user.id);
  const leagues = await League.find({ entrants: { $in: [req.params.id] } })
    .populate("entrants")
    .sort("overallPoints")
    .sort("matchdayPoints")
    .sort("mgrId");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  res.status(200).json(leagues);*/
  
  const league = await League.find({});
  res.status(200).json(league);
});

//@desc Get League for a specific user
//@route GET /api/leagues/:id
//@access Private
const getLeague = asyncHandler(async (req, res) => {
  const league = await League.findById(req.params.id)
    /*.populate("entrants")
    .sort("overallPoints")
    .sort("matchdayPoints")
    .sort("mgrId");*/
  res.status(200).json(league);
});

//@desc Get League for a specific user
//@route GET /api/leagues/:id
//@access Private
const getTeamLeague = asyncHandler(async (req, res) => {
  const league = await TeamLeague.findById(req.params.id)
    /*.populate("entrants")
    .sort("overallPoints")
    .sort("matchdayPoints")
    .sort("mgrId");*/
  res.status(200).json(league);
});

//@desc Get League for a specific user
//@route GET /api/leagues/:id
//@access Private
const getOverallLeague = asyncHandler(async (req, res) => {
  const league = await OverallLeague.findById(req.params.id)
  res.status(200).json(league);
});

//@desc Update team League details
//@route PATCH /api/leagues/teamleagues/:id
//@access Private
//@role ADMIN
const editTeamLeague = asyncHandler(async (req, res) => {
  const league = TeamLeague.findById(req.params.id)
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if(!league) {
    res.status(404)
    throw new Error(`League not found`)
  }

  const updatedTeamLeague = await TeamLeague.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json(updatedTeamLeague)
});

//@desc Update team League details
//@route PATCH /api/leagues/overallleagues/:id
//@access Private
//@role ADMIN
const editOverallLeague = asyncHandler(async (req, res) => {
  const league = OverallLeague.findById(req.params.id)
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if(!league) {
    res.status(404)
    throw new Error(`League not found`)
  }

  const updatedOverallLeague = await OverallLeague.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json(updatedOverallLeague)
});

//@desc Update team League details
//@route PATCH /api/leagues/privateleagues/:id
//@access Private
//@role ADMIN
const editLeague = asyncHandler(async (req, res) => {
  const league = League.findById(req.params.id)
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if(!league) {
    res.status(404)
    throw new Error(`League not found`)
  }

  const updatedLeague = await League.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json(updatedLeague)
});

//@desc Delete League
//@route DELETE /api/leagues/:id
//@access Private
const deleteLeague = asyncHandler(async (req, res) => {
  const league = await League.findOne({ id: req.params.id });

  if (!league) {
    res.status(400);
    throw new Error("League not found");
  }

  // check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the user
  if (!Object.values(req.user.roles).includes(2048) && league.admin === null) {
    res.status(401);
    throw new Error("User not authorized");
  }

  if (
    !Object.values(req.user.roles).includes(2048) &&
    league.admin.toString() !== req.user.id
  ) {
    res.status(401);
    throw new Error("You are not the admin");
  }

  await League.findOneAndDelete({ id: req.params.id });
  res.status(200).json({ id: req.params.id });
});

//@desc Delete League
//@route DELETE /api/leagues/teamleagues/:id
//@access Private
const deleteTeamLeague = asyncHandler(async (req, res) => {
  const league = await TeamLeague.findById(req.params.id);

  if (!league) {
    res.status(400);
    throw new Error("League not found");
  }

  // check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  await TeamLeague.findByIdAndDelete(req.params.id);
  res.status(200).json({ id: req.params.id });
});

//@desc Delete League
//@route DELETE /api/leagues/overallleagues/:id
//@access Private
const deleteOverallLeague = asyncHandler(async (req, res) => {
  const league = await OverallLeague.findById(req.params.id);

  if (!league) {
    res.status(400);
    throw new Error("League not found");
  }

  // check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

    await OverallLeague.findByIdAndDelete(req.params.id);
  res.status(200).json({ id: req.params.id });
});

export {
  setLeague,
  setOverallLeague,
  setTeamLeague,
  addToLeague,
  getLeagues,
  getLeague,
  getOverallLeague,
  getTeamLeague,
  editLeague,
  editTeamLeague,
  editOverallLeague,
  deleteLeague,
  deleteTeamLeague,
  deleteOverallLeague,
  getTeamLeagues,
  getOverallLeagues,
};
