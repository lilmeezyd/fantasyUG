import asyncHandler from "express-async-handler";
import League from "../models/leagueModel.js";
import OverallLeague from "../models/overallLeagueModel.js";
import TeamLeague from "../models/teamLeagueModel.js";
import User from "../models/userModel.js";
import ManagerInfo from "../models/managerInfoModel.js";
import ManagerLive from "../models/managerLive.js";
import Matchday from "../models/matchdayModel.js";
import Team from "../models/teamModel.js";
import Weekly from "../models/weeklyStandingModel.js";
import Overall from "../models/overallStandingModel.js";

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
  const entryCode = "";

  const league = await League.create({
    name,
    startMatchday,
    endMatchday,
    creator: req.user,
    leagueType: req.user.roles.NORMAL_USER ? "Private" : req?.body?.leagueType,
    entrants: [],
    entryCode,
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
    entrants: [],
  });

  res.status(200).json(league);
});

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
    entrants: [],
  });

  res.status(200).json(league);
});

//@desc Join Overall league
//@route PATCH /api/leagues/overallleagues/:id/join
//@access Private
const joinOverallLeague = asyncHandler(
  async (userObj, manager, overallLeague, session) => {
    const managerInfo = await ManagerInfo.findById(manager);
    const oldLeagues = managerInfo ? managerInfo.overallLeagues : [];
    const oldLeaguesIds = oldLeagues.map((x) => x.id);
    const requiredLeague = await League.findById(overallLeague);
    const oldEntrants = requiredLeague.entrants;
    const oldEntrantsIds = oldEntrants.map((x) => x.toString());
    const { id } = requiredLeague;
    if (oldLeaguesIds.includes(id) && oldEntrantsIds.includes(manager)) {
      throw new Error("Already in the league");
    }

    //Find user
    if (!userObj) {
      throw new Error("User not found");
    }

    return await League.findByIdAndUpdate(
      overallLeague,
      { $addToSet: { entrants: manager } },
      {
        new: true,
        session,
      },
    );
  },
);

//@desc Join Overall league
//@route PATCH /api/leagues/teamleagues/:id/join
//@access Private
const joinTeamLeague = asyncHandler(
  async (userObj, manager, playerLeague, session) => {
    const managerInfo = await ManagerInfo.findById(manager);
    const oldLeagues = managerInfo ? managerInfo.teamLeagues : [];
    const oldLeaguesIds = oldLeagues.map((x) => x.id);
    const requiredLeague = await League.findById(playerLeague);
    const teamLeagues = await League.find({});
    const teamLeagueIds = teamLeagues.map((x) => x.id);
    const oldEntrants = requiredLeague.entrants;
    const oldEntrantsIds = oldEntrants.map((x) => x.toString());
    //const entrants = [...oldEntrants, manager];
    const { id } = requiredLeague;
    const inTeamLeagueArray = oldLeaguesIds.map((x) =>
      teamLeagueIds.includes(x) ? true : false,
    );

    if (oldLeaguesIds.includes(id) && oldEntrantsIds.includes(manager)) {
      throw new Error("Already in the league");
    }

    if (inTeamLeagueArray.includes(true) && oldEntrantsIds.includes(manager)) {
      throw new Error("Already in a team league, can only be in one!");
    }

    //Find user
    if (!userObj) {
      throw new Error("User not found");
    }

    return await League.findByIdAndUpdate(
      playerLeague,
      { $addToSet: { entrants: manager } },
      {
        new: true,
        session,
      },
    );
  },
);

//@desc Join Overall league
//@route PATCH /api/leagues/privateleagues/:id/join
//@access Private
const joinPrivateLeague = asyncHandler(async (req, res) => {
  const managerInfo = await ManagerInfo.findOne({ user: req.user.id });
  const oldLeagues = managerInfo ? managerInfo.privateLeagues : [];
  const oldLeaguesIds = oldLeagues.map((x) => x.id);
  const requiredLeague = await League.findById(req.params.id);
  const oldEntrants = requiredLeague.entrants;
  const oldEntrantsIds = oldEntrants.map((x) => x.toString());
  const entrants = [...oldEntrants, req.user.id];
  const { creator, name, id, startMatchday, endMatchday } = requiredLeague;

  if (oldLeaguesIds.includes(id)) {
    throw new Error("Already in the league");
  }
  if (oldEntrantsIds.includes(req.user.id)) {
    throw new Error("Already in the league");
  }

  //Find user
  if (!req.user) {
    throw new Error("User not found");
  }

  const newLeague = {
    creator,
    name,
    id,
    startMatchday,
    endMatchday,
    lastRank: null,
    currentRank: null,
    matchdayPoints: 0,
    overallPoints: 0,
  };

  const leagues = [...oldLeagues, req.params.id];

  await ManagerInfo.findOneAndUpdate(
    { user: req.user.id },
    { privateLeagues: leagues },
    { new: true },
  );

  const league = await League.findByIdAndUpdate(
    req.params.id,
    { entrants: entrants },
    {
      new: true,
    },
  );

  res.status(200).json(league);
});

//@desc Get default leagues
//@route GET /api/leagues/teamleagues
//@access Public
const getTeamLeagues = asyncHandler(async (req, res) => {
  const leagues = await League.find({ leagueType: "Team" });
  res.status(200).json(leagues);
});

//@desc Get default leagues
//@route GET /api/leagues/overallleagues
//@access Public
const getOverallLeagues = asyncHandler(async (req, res) => {
  const leagues = await League.find({ leagueType: "Overall" });
  res.status(200).json(leagues);
});

//@desc Get Leagues for a specific user
//@route GET /api/leagues/users/:id
//@access Private
const getPrivateLeagues = asyncHandler(async (req, res) => {
  const leagues = await League.find({ leagueType: "Private" });
  res.status(200).json(leagues);
});

//@desc Get League for a specific user
//@route GET /api/leagues/:id
//@access Private
const getLeague = asyncHandler(async (req, res) => {
  const league = await League.findById(req.params.id).lean();
  const matchdays = await Matchday.find({}).lean();
  const matchdaysMap = new Map(matchdays.map((x) => [x._id.toString(), x.id]));
  const revampedLeague = {
    ...league,
    startMatchday: matchdaysMap.get(league.startMatchday.toString()),
    endMatchday: matchdaysMap.get(league.endMatchday.toString()),
    startMatchdayId: league.startMatchday,
    endMatchdayId: league.endMatchday,
  };
  res.status(200).json(revampedLeague);
});

//@desc Get a Team League
//@route GET /api/teamleagues/:id
//@access Private
//@access ADMIN & NORMAL_USER
const getTeamLeague = asyncHandler(async (req, res) => {
  const league = await TeamLeague.findById(req.params.id)
    .populate("entrants")
    .exec();
  const currentMatchay = await Matchday.findOne({ current: true });
  const nextMatchay = await Matchday.findOne({ next: true });

  if (!league) {
    res.status(404);
    throw new Error("League not found");
  }
  const matchdayId = currentMatchay?.id || nextMatchay?.id || 30;
  const {
    _id,
    team,
    startMatchday,
    endMatchday,
    creator,
    createdAt,
    updatedAt,
    entrants,
    standings,
  } = league;
  const startGW = await Matchday.findById(startMatchday);
  const teamName = await Team.findById(team);

  const sortedStandings = [...standings].sort(
    (a, b) => b.overallPoints - a.overallPoints,
  );

  const newLeague = {
    _id,
    team,
    name: teamName?.name,
    startMatchday: startGW?.id,
    startGW: startMatchday,
    currentMatchday: matchdayId,
    endMatchday,
    creator,
    createdAt,
    updatedAt,
    entrants,
    standings: sortedStandings,
  };

  res.status(200).json(newLeague);
});

//@desc Get an Overall Standings
//@route GET /api/league/:id/standings
//@access Private
//@access ADMIN & NORMAL_USER
const getOverallStandings = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const standings = await Overall.find({ leagueId: req.params.id })
    .populate({
      path: "manager",
      select: "firstName lastName teamName user",
    })
    .sort({ rank: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const entrants = await League.findOne({ _id: req.params.id }).populate({
    path: "entrants",
    select: "firstName lastName teamName user",
  });
  const total = await Overall.countDocuments({ leagueId: req.params.id });
  res.status(200).json({
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    standings,
    entrants: entrants?.entrants,
  });
});

//@desc Get an Weekly standings
//@route GET /api/league/:id/standings/matchday/:mid
//@access Private
//@access ADMIN & NORMAL_USER
const getWeeklyStandings = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const standings = await Weekly.find({
    leagueId: req.params.id,
    matchday: req.params.mid,
  })
    .populate({
      path: "manager",
      select: "firstName lastName teamName user",
    })
    .sort({ rank: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const entrants = await League.findOne({ _id: req.params.id }).populate({
    path: "entrants",
    select: "firstName lastName teamName user",
  });
  const total = await Weekly.countDocuments({
    leagueId: req.params.id,
    matchday: Number(req.params.mid),
  });
  res.status(200).json({
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    standings,
    entrants: entrants?.entrants,
  });
});

//@desc Update team League details
//@route PATCH /api/leagues/teamleagues/:id
//@access Private
//@role ADMIN
const editTeamLeague = asyncHandler(async (req, res) => {
  const league = TeamLeague.findById(req.params.id);
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!league) {
    res.status(404);
    throw new Error(`League not found`);
  }

  const updatedTeamLeague = await TeamLeague.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );
  res.status(200).json(updatedTeamLeague);
});

//@desc Update team League details
//@route PATCH /api/leagues/overallleagues/:id
//@access Private
//@role ADMIN
const editOverallLeague = asyncHandler(async (req, res) => {
  const league = OverallLeague.findById(req.params.id);
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!league) {
    res.status(404);
    throw new Error(`League not found`);
  }

  const updatedOverallLeague = await OverallLeague.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );
  res.status(200).json(updatedOverallLeague);
});

//@desc Update team League details
//@route PATCH /api/leagues/privateleagues/:id
//@access Private
//@role ADMIN
const editLeague = asyncHandler(async (req, res) => {
  const league = League.findById(req.params.id);
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!league) {
    res.status(404);
    throw new Error(`League not found`);
  }

  const updatedLeague = await League.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );
  res.status(200).json(updatedLeague);
});

//@desc Delete League
//@route DELETE /api/leagues/:id
//@access Private
const deleteLeague = asyncHandler(async (req, res) => {
  const league = await League.findById(req.params.id);

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
  if (!Object.values(req.user.roles).includes(256) && league.admin === null) {
    res.status(401);
    throw new Error("User not authorized");
  }

  if (
    !Object.values(req.user.roles).includes(256) &&
    league.admin.toString() !== req.user.id
  ) {
    res.status(401);
    throw new Error("You are not the admin");
  }

  await League.findByIdAndDelete(req.params.id);
  res.status(200).json({ msg: `League named ${league.name} deleted` });
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

const updateOverallTable = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true }).lean();
  const matchdays = await Matchday.find({}).lean();
  if (!matchday) {
    return res.status(404).json({ message: "No current matchday found." });
  }

  const matchdayNumber = matchday.id;
  const matchdayMap = new Map(matchdays.map((x) => [x._id.toString(), x.id]));
  await League.aggregate([
    { $match: { leagueType: "Overall" } },

    {
      $lookup: {
        from: "managerinfos",
        localField: "entrants",
        foreignField: "_id",
        as: "managerInfos",
      },
    },

    {
      $set: {
        eligibleEntrants: {
          $map: {
            input: {
              $filter: {
                input: "$managerInfos",
                as: "manager",
                cond: {
                  $lte: ["$$manager.matchdayJoined", matchdayNumber],
                },
              },
            },
            as: "manager",
            in: "$$manager._id",
          },
        },
      },
    },

    {
      $set: {
        standings: {
          $setUnion: [{ $ifNull: ["$standings", []] }, "$eligibleEntrants"],
        },
        entrants: {
          $setDifference: ["$entrants", "$eligibleEntrants"],
        },
      },
    },

    {
      $project: {
        managerInfos: 0,
        eligibleEntrants: 0,
      },
    },
    {
      $merge: {
        into: "leagues",
        on: "_id",
        whenMatched: "merge",
        whenNotMatched: "discard",
      },
    },
  ]);
  const leagues = await League.find({ leagueType: "Overall" }).lean();
  const managers = await ManagerInfo.find({}).lean();
  const aggArray = [];
  /*for (const league of leaguez) {
  const a = await TeamLeague.aggregate([
  { $match: { _id: league._id } },
  {
    $lookup: {
      from: "managerinfos",
      localField: "standings.user",
      foreignField: "user",
      as: "managerDocs"
    }
  },
  {
    $addFields: {
      standings: {
        $map: {
          input: "$standings",
          as: "s",
          in: {
            $let: {
              vars: {
                manager: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$managerDocs",
                        as: "m",
                        cond: { $eq: ["$$m.user", "$$s.user"] }
                      }
                    },
                    0
                  ]
                }
              },
              in: "$$manager._id"
            }
          }
        }
      }
    }
  },
  { $project: { managerDocs: 0 } },
  {
    $merge: {
      into: "leagues",       // target collection
      on: "_id",             // match by _id
      whenMatched: "merge",  // update existing doc
      whenNotMatched: "insert" // don’t insert new
    }
  }
]);


  console.log(a);
  aggArray.push(...a)
}*/

  for (const league of leagues) {
    const startGW = matchdayMap.get(league.startMatchday.toString());
    const endGW = matchdayMap.get(league.endMatchday.toString());
    await ManagerLive.aggregate([
      { $match: { matchday: matchdayNumber } },
      {
        $group: {
          _id: {
            manager: "$manager",
            matchday: "$matchday",
          },
          matchdayPoints: { $sum: "$matchdayPoints" },
        },
      },
      {
        $project: {
          _id: 0,
          manager: "$_id.manager",
          matchday: "$_id.matchday",
          matchdayPoints: 1,
          leagueId: league._id,
        },
      },
      {
        $sort: { matchdayPoints: -1, manager: 1 },
      },
      {
        $setWindowFields: {
          sortBy: { matchdayPoints: -1 },
          output: {
            rank: {
              $rank: {},
            },
            oldRank: {
              $rank: {},
            },
          },
        },
      },
      {
        $merge: {
          into: "weeklies",
          on: ["manager", "matchday", "leagueId"],
          whenMatched: "replace",
          whenNotMatched: "insert",
        },
      },
    ]);

    await ManagerLive.aggregate([
      {
        $match: {
          matchday: { $gte: startGW, $lte: endGW },
        },
      },
      {
        $group: {
          _id: { manager: "$manager" },
          overallPoints: { $sum: "$matchdayPoints" },
        },
      },
      {
        $project: {
          _id: 0,
          manager: "$_id.manager",
          leagueId: league._id,
          overallPoints: 1,
        },
      },
      { $sort: { overallPoints: -1, manager: 1 } },
      {
        $setWindowFields: {
          sortBy: { overallPoints: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      {
        $merge: {
          into: "overalls",
          on: ["manager", "leagueId"],
          whenMatched: [
            {
              $set: {
                oldRank: "$$old.rank",
                rank: "$rank",
                overallPoints: "$overallPoints",
              },
            },
          ],
          whenNotMatched: "insert",
        },
      },
    ]);
  }

  res.status(200).json({
    aggArray,
    leagues,
    message: "Overall tables updated successfully.",
  });
});

const updateTeamTables = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true }).lean();
  const matchdays = await Matchday.find({}).lean();
  if (!matchday) {
    return res.status(404).json({ message: "No current matchday found." });
  }

  const matchdayNumber = matchday.id;
  const matchdayMap = new Map(matchdays.map((x) => [x._id.toString(), x.id]));
  await League.aggregate([
    { $match: { leagueType: "Team" } },

    {
      $lookup: {
        from: "managerinfos",
        localField: "entrants",
        foreignField: "_id",
        as: "managerInfos",
      },
    },

    {
      $set: {
        eligibleEntrants: {
          $map: {
            input: {
              $filter: {
                input: "$managerInfos",
                as: "manager",
                cond: {
                  $lte: ["$$manager.matchdayJoined", matchdayNumber],
                },
              },
            },
            as: "manager",
            in: "$$manager._id",
          },
        },
      },
    },

    {
      $set: {
        standings: {
          $setUnion: [{ $ifNull: ["$standings", []] }, "$eligibleEntrants"],
        },
        entrants: {
          $setDifference: ["$entrants", "$eligibleEntrants"],
        },
      },
    },

    {
      $project: {
        managerInfos: 0,
        eligibleEntrants: 0,
      },
    },
    {
      $merge: {
        into: "leagues",
        on: "_id",
        whenMatched: "merge",
        whenNotMatched: "discard",
      },
    },
  ]);
  const leagues = await League.find({ leagueType: "Team" }).lean();

  for (const league of leagues) {
    const startGW = matchdayMap.get(league.startMatchday.toString());
    const endGW = matchdayMap.get(league.endMatchday.toString());
    const standings = league.standings;
    const a = await ManagerLive.aggregate([
      { $match: { matchday: matchdayNumber, manager: { $in: standings } } },
      {
        $group: {
          _id: {
            manager: "$manager",
            matchday: "$matchday",
          },
          matchdayPoints: { $sum: "$matchdayPoints" },
        },
      },
      {
        $project: {
          _id: 0,
          manager: "$_id.manager",
          matchday: "$_id.matchday",
          matchdayPoints: 1,
          leagueId: league._id,
        },
      },
      {
        $sort: { matchdayPoints: -1, manager: 1 },
      },
      {
        $setWindowFields: {
          sortBy: { matchdayPoints: -1 },
          output: {
            rank: {
              $rank: {},
            },
            oldRank: {
              $rank: {},
            },
          },
        },
      },
      {
        $merge: {
          into: "weeklies",
          on: ["manager", "matchday", "leagueId"],
          whenMatched: "replace",
          whenNotMatched: "insert",
        },
      },
    ]);

    await ManagerLive.aggregate([
      {
        $match: {
          matchday: { $gte: startGW, $lte: endGW },
          manager: { $in: standings },
        },
      },
      {
        $group: {
          _id: { manager: "$manager" },
          overallPoints: { $sum: "$matchdayPoints" },
        },
      },
      {
        $project: {
          _id: 0,
          manager: "$_id.manager",
          leagueId: league._id,
          overallPoints: 1,
        },
      },
      { $sort: { overallPoints: -1, manager: 1 } },
      {
        $setWindowFields: {
          sortBy: { overallPoints: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      {
        $merge: {
          into: "overalls",
          on: ["manager", "leagueId"],
          whenMatched: [
            {
              $set: {
                oldRank: "$$old.rank",
                rank: "$rank",
                overallPoints: "$overallPoints",
              },
            },
          ],
          whenNotMatched: "insert",
        },
      },
    ]);
  }

  res.status(200).json({ message: "Team tables updated successfully." });
});
const updatePrivateTables = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true }).lean();
  const matchdays = await Matchday.find({}).lean();
  if (!matchday) {
    return res.status(404).json({ message: "No current matchday found." });
  }

  const matchdayNumber = matchday.id;
  const matchdayMap = new Map(matchdays.map((x) => [x._id.toString(), x.id]));
  await League.aggregate([
    { $match: { leagueType: "Private" } },

    {
      $lookup: {
        from: "managerinfos",
        localField: "entrants",
        foreignField: "_id",
        as: "managerInfos",
      },
    },

    {
      $set: {
        eligibleEntrants: {
          $map: {
            input: {
              $filter: {
                input: "$managerInfos",
                as: "manager",
                cond: {
                  $lte: ["$$manager.matchdayJoined", matchdayNumber],
                },
              },
            },
            as: "manager",
            in: "$$manager._id",
          },
        },
      },
    },

    {
      $set: {
        standings: {
          $setUnion: [{ $ifNull: ["$standings", []] }, "$eligibleEntrants"],
        },
        entrants: {
          $setDifference: ["$entrants", "$eligibleEntrants"],
        },
      },
    },

    {
      $project: {
        managerInfos: 0,
        eligibleEntrants: 0,
      },
    },
    {
      $merge: {
        into: "leagues",
        on: "_id",
        whenMatched: "merge",
        whenNotMatched: "discard",
      },
    },
  ]);
  const leagues = await League.find({ leagueType: "Private" }).lean();
  for (const league of leagues) {
    const startGW = matchdayMap.get(league.startMatchday.toString());
    const endGW = matchdayMap.get(league.endMatchday.toString());
    const standings = league.standings;
    const a = await ManagerLive.aggregate([
      { $match: { matchday: matchdayNumber, manager: { $in: standings } } },
      {
        $group: {
          _id: {
            manager: "$manager",
            matchday: "$matchday",
          },
          matchdayPoints: { $sum: "$matchdayPoints" },
        },
      },
      {
        $project: {
          _id: 0,
          manager: "$_id.manager",
          matchday: "$_id.matchday",
          matchdayPoints: 1,
          leagueId: league._id,
        },
      },
      {
        $sort: { matchdayPoints: -1, manager: 1 },
      },
      {
        $setWindowFields: {
          sortBy: { matchdayPoints: -1 },
          output: {
            rank: {
              $rank: {},
            },
            oldRank: {
              $rank: {},
            },
          },
        },
      },
      {
        $merge: {
          into: "weeklies",
          on: ["manager", "matchday", "leagueId"],
          whenMatched: "replace",
          whenNotMatched: "insert",
        },
      },
    ]);

    await ManagerLive.aggregate([
      {
        $match: {
          matchday: { $gte: startGW, $lte: endGW },
          manager: { $in: standings },
        },
      },
      {
        $group: {
          _id: { manager: "$manager" },
          overallPoints: { $sum: "$matchdayPoints" },
        },
      },
      {
        $project: {
          _id: 0,
          manager: "$_id.manager",
          leagueId: league._id,
          overallPoints: 1,
        },
      },
      { $sort: { overallPoints: -1, manager: 1 } },
      {
        $setWindowFields: {
          sortBy: { overallPoints: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      {
        $merge: {
          into: "overalls",
          on: ["manager", "leagueId"],
          whenMatched: [
            {
              $set: {
                oldRank: "$$old.rank",
                rank: "$rank",
                overallPoints: "$overallPoints",
              },
            },
          ],
          whenNotMatched: "insert",
        },
      },
    ]);
  }

  res.status(200).json({ message: "Private tables updated successfully." });
});

const setCurrentAndLastRanks = asyncHandler(async (req, res) => {
  const overallLeagues = await OverallLeague.find({}).lean();
  const teamLeagues = await TeamLeague.find({}).lean();
  //const privateLeagues = await League.find({}).lean()

  //Setting current and last ranks for overall leagues
  if (overallLeagues) {
    // Using a for...of loop to ensure proper async handling
    for (let league of overallLeagues) {
      const { standings, _id: leagueId } = league;

      if (standings.length === 0) continue;

      // Update league standings with new lastRank
      const newStandings = standings.map((entry) => ({
        ...entry,
        lastRank: entry.currentRank,
      }));

      await OverallLeague.findByIdAndUpdate(leagueId, {
        $set: { standings: newStandings },
      });

      // Prepare bulkWrite updates for ManagerInfo
      const bulkOps = newStandings.map(({ user, currentRank, lastRank }) => ({
        updateOne: {
          filter: { user },
          update: {
            $set: {
              "overallLeagues.$[el].currentRank": currentRank,
              "overallLeagues.$[el].lastRank": lastRank,
            },
          },
          arrayFilters: [{ "el.id": leagueId.toString() }],
        },
      }));
      // Perform all updates in one DB operation
      if (bulkOps.length > 0) {
        await ManagerInfo.bulkWrite(bulkOps, { ordered: false });
      }
    }
  }
  //Setting current and last ranks for team leagues
  if (teamLeagues) {
    // Using a for...of loop to ensure proper async handling
    for (let league of teamLeagues) {
      const { standings, _id: leagueId } = league;

      if (standings.length === 0) continue;

      // Update league standings with new lastRank
      const newStandings = standings.map((entry) => ({
        ...entry,
        lastRank: entry.currentRank,
      }));

      await TeamLeague.findByIdAndUpdate(leagueId, {
        $set: { standings: newStandings },
      });

      // Prepare bulkWrite updates for ManagerInfo
      const bulkOps = newStandings.map(({ user, currentRank, lastRank }) => ({
        updateOne: {
          filter: { user },
          update: {
            $set: {
              "teamLeagues.$[el].currentRank": currentRank,
              "teamLeagues.$[el].lastRank": lastRank,
            },
          },
          arrayFilters: [{ "el.id": leagueId.toString() }],
        },
      }));
      // Perform all updates in one DB operation
      if (bulkOps.length > 0) {
        await ManagerInfo.bulkWrite(bulkOps, { ordered: false });
      }
    }
  }

  ////Setting current and last ranks for private leagues

  res.status(201).json({ message: "All Tables updated" });
});

export {
  getOverallStandings,
  getWeeklyStandings,
  setLeague,
  setOverallLeague,
  setTeamLeague,
  joinOverallLeague,
  joinPrivateLeague,
  joinTeamLeague,
  getLeague,
  getTeamLeague,
  editLeague,
  editTeamLeague,
  editOverallLeague,
  deleteLeague,
  deleteTeamLeague,
  deleteOverallLeague,
  getTeamLeagues,
  getOverallLeagues,
  getPrivateLeagues,
  updateOverallTable,
  updateTeamTables,
  updatePrivateTables,
  setCurrentAndLastRanks,
};
