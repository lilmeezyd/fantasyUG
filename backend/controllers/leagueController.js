import asyncHandler from "express-async-handler";
import League from "../models/leagueModel.js";
import Team from "../models/teamModel.js";
import User from "../models/userModel.js";
import ManagerInfo from "../models/managerInfoModel.js";

//@desc Set League
//@route POST /api/leagues
//@access Private
const setLeague = asyncHandler(async (req, res) => {
  const generalLeagues = {
    "Arua Hills": 1,
    "Bul Bidco": 2,
    "Busoga United": 3,
    Express: 4,
    Gaddafi: 5,
    KCCA: 6,
    Kitara: 7,
    Maroons: 8,
    "Mbarara City": 9,
    NEC: 10,
    "SC Villa": 11,
    "Bright Stars": 12,
    URA: 13,
    UPDF: 14,
    Vipers: 15,
    "Wakiso Giants": 16,
    Neutral: 17,
    Overall: 18,
  };
  const { name, startMatchday, endMatchday } = req.body;
  //const userId = await User.findById(req.user.id)
  const nameFound = await League.findOne({ name });
  const leagues = await League.find({});
  const maxId = Math.max(...leagues.map((x) => x.id));
  let admin, id;
  if (!name || !startMatchday) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (Object.values(req.user.roles).includes(2048)) {
    if (nameFound) {
      res.status(400);
      throw new Error("League name already assigned");
    }
    if (
      !Object.keys(generalLeagues)
        .map((x) => x.toLowerCase())
        .includes(name.toLowerCase())
    ) {
      res.status(400);
      throw new Error("Trying to create invalid league!");
    }
    id = generalLeagues[name];
    admin = null;
    if (!id) {
      res.status(400);
      throw new Error(`League does not exist`);
    }
  }

  if (!Object.values(req.user.roles).includes(2048)) {
    id = maxId + 1;
    admin = req.user.id;
  }

  const league = await League.create({
    id,
    name,
    startMatchday,
    endMatchday,
    admin,
    entrants: [],
  });

  res.status(200).json(league);
});

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
//@route GET /api/leagues/teams
//@access Public
const getTeamLeagues = asyncHandler(async (req, res) => {
  const leagues = await League.find({ id: { $lte: 17 } });
  res.status(200).json(leagues);
});

//@desc Get default leagues
//@route GET /api/leagues/overall
//@access Public
const getOverallLeague = asyncHandler(async (req, res) => {
  const league = await League.findOne({ id: 18 });
  res.status(200).json(league);
});

//@desc Get Leagues for a specific user
//@route GET /api/leagues/users/:id
//@access Private
const getLeagues = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const leagues = await League.find({ entrants: { $in: [req.params.id] } })
    .populate("entrants")
    .sort("overallPoints")
    .sort("matchdayPoints")
    .sort("mgrId");

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  res.status(200).json(leagues);
});

//@desc Get League for a specific user
//@route GET /api/leagues/:id
//@access Private
const getLeague = asyncHandler(async (req, res) => {
  const league = await League.findById(req.params.id)
    .populate("entrants")
    .sort("overallPoints")
    .sort("matchdayPoints")
    .sort("mgrId");
  res.status(200).json(league);
});

const editLeague = asyncHandler(async (req, res) => {});

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

export {
  setLeague,
  addToLeague,
  getLeagues,
  getLeague,
  editLeague,
  deleteLeague,
  getTeamLeagues,
  getOverallLeague,
};
