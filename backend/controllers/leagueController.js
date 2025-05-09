import asyncHandler from "express-async-handler";
import League from "../models/leagueModel.js";
import OverallLeague from "../models/overallLeagueModel.js";
import TeamLeague from "../models/teamLeagueModel.js";
import User from "../models/userModel.js";
import ManagerInfo from "../models/managerInfoModel.js";
import ManagerLive from "../models/managerLive.js";
import Matchday from "../models/matchdayModel.js";

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
  async (userObj, manager, overallLeague, session, req, res) => {
    const managerInfo = await ManagerInfo.findById(manager);
    const oldLeagues = managerInfo ? managerInfo.overallLeagues : [];
    const oldLeaguesIds = oldLeagues.map((x) => x.id);
    const requiredLeague = await OverallLeague.findById(overallLeague);
    const oldEntrants = requiredLeague.entrants;
    const oldEntrantsIds = oldEntrants.map((x) => x.toString());
    const { id } = requiredLeague;

    if (oldLeaguesIds.includes(id)) {
      res.status(400);
      throw new Error("Already in the league");
    }

    if (oldEntrantsIds.includes(manager)) {
      res.status(400);
      throw new Error("Already in the league");
    }

    //Find user
    if (!userObj) {
      res.status(400);
      throw new Error("User not found");
    }

    await OverallLeague.findByIdAndUpdate(
      overallLeague,
      { $push: { entrants: manager } },
      {
        new: true,
      }
      , { session });

  }
);

//@desc Join Overall league
//@route PATCH /api/leagues/teamleagues/:id/join
//@access Private
const joinTeamLeague = asyncHandler(
  async (userObj, manager, playerLeague, session, req, res) => {
    const managerInfo = await ManagerInfo.findById(manager);
    const oldLeagues = managerInfo ? managerInfo.teamLeagues : [];
    const oldLeaguesIds = oldLeagues.map((x) => x.id);
    const requiredLeague = await TeamLeague.findById(playerLeague);
    const teamLeagues = await TeamLeague.find({});
    const teamLeagueIds = teamLeagues.map((x) => x.id);
    const oldEntrants = requiredLeague.entrants;
    const oldEntrantsIds = oldEntrants.map((x) => x.toString());
    //const entrants = [...oldEntrants, manager];
    const { id } = requiredLeague;
    const inTeamLeagueArray = oldLeaguesIds.map((x) =>
      teamLeagueIds.includes(x) ? true : false
    );

    if (oldLeaguesIds.includes(id)) {
      res.status(400);
      throw new Error("Already in the league");
    }
    if (oldEntrantsIds.includes(manager)) {
      res.status(400);
      throw new Error("Already in the league");
    }

    if (inTeamLeagueArray.includes(true)) {
      res.status(400);
      throw new Error("Already in a team league, can only be in one!");
    }

    //Find user
    if (!userObj) {
      res.status(400);
      throw new Error("User not found");
    }

    await TeamLeague.findByIdAndUpdate(
      playerLeague,
      { $push: { entrants: manager } },
      {
        new: true,
      }
      , { session });
  }
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
    res.status(400);
    throw new Error("Already in the league");
  }
  if (oldEntrantsIds.includes(req.user.id)) {
    res.status(400);
    throw new Error("Already in the league");
  }

  //Find user
  if (!req.user) {
    res.status(400);
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

  const leagues = [...oldLeagues, newLeague];

  await ManagerInfo.findOneAndUpdate(
    { user: req.user.id },
    { privateLeagues: leagues },
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
  const league = await League.findById(req.params.id);
  /*.populate("entrants")
    .sort("overallPoints")
    .sort("matchdayPoints")
    .sort("mgrId");*/
  res.status(200).json(league);
});

//@desc Get a Team League
//@route GET /api/teamleagues/:id
//@access Private
//@access ADMIN & NORMAL_USER
const getTeamLeague = asyncHandler(async (req, res) => {
  const league = await TeamLeague.findById(req.params.id)
    .populate("entrants")
    .exec();

  if (!league) {
    res.status(404);
    throw new Error("League not found");
  }

  const {
    _id,
    name,
    startMatchday,
    endMatchday,
    creator,
    createdAt,
    updatedAt,
    entrants,
    standings
  } = league;

  const sortedStandings = [...standings].sort(
    (a, b) => b.overallPoints - a.overallPoints
  );

  const newLeague = {
    _id,
    name,
    startMatchday,
    endMatchday,
    creator,
    createdAt,
    updatedAt,
    entrants,
    standings: sortedStandings
  };

  res.status(200).json(newLeague);
});

//@desc Get an Overall League
//@route GET /api/overallleagues/:id
//@access Private
//@access ADMIN & NORMAL_USER
const getOverallLeague = asyncHandler(async (req, res) => {
  const league = await OverallLeague.findById(req.params.id)
    .populate("entrants")
    .exec();

  if (!league) {
    res.status(404);
    throw new Error("League not found");
  }

  const {
    _id,
    name,
    startMatchday,
    endMatchday,
    creator,
    createdAt,
    updatedAt,
    entrants,
    standings
  } = league;

  const sortedStandings = [...standings].sort(
    (a, b) => b.overallPoints - a.overallPoints
  );

  const newLeague = {
    _id,
    name,
    startMatchday,
    endMatchday,
    creator,
    createdAt,
    updatedAt,
    entrants,
    standings: sortedStandings
  };

  res.status(200).json(newLeague);
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
    }
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
    }
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
    }
  );
  res.status(200).json(updatedLeague);
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

const updateOverallTable = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true }).lean();
  if (!matchday) {
    return res.status(404).json({ message: "No current matchday found." });
  }

  const matchdayNumber = matchday.id;
  const overallLeagues = await OverallLeague.find({}).lean();

  for (const league of overallLeagues) {
    const entrantIds = league.entrants || [];
    const oldUserIds = league.standings.map(s => s.user);
    const allUserIds = [...new Set([...entrantIds, ...oldUserIds])];

    // Pull all related manager info at once
    const managerInfos = await ManagerInfo.find({ user: { $in: allUserIds } }).lean();
    const infoMap = Object.fromEntries(managerInfos.map(m => [m.user, m]));

    // Build all updated standings
    const newStandings = [...league.standings]; // start with existing
    for (const entrantId of entrantIds) {
      const info = managerInfos.find(m => m._id.toString() === entrantId.toString());
      if (!info) continue;
      const ligi = info.overallLeagues?.[0] || {};
      newStandings.push({
        user: info.user,
        firstName: info.firstName,
        lastName: info.lastName,
        teamName: info.teamName,
        lastRank: ligi.lastRank || null,
        currentRank: ligi.currentRank || null,
        overallPoints: ligi.overallPoints || 0,
        matchdays: { [matchdayNumber]: ligi.matchdayPoints || 0 },
        mdRanks: {},
      });
    }

    // Update matchday points for all standings
    const finalStandings = newStandings.map(s => {
      const info = infoMap[s.user];
      const mdPoints = info?.matchdayPoints || 0;
      const updatedMd = { ...s.matchdays, [matchdayNumber]: mdPoints };
      const totalPoints = Object.values(updatedMd).reduce((a, b) => a + b, 0);
      return { ...s, matchdays: updatedMd, overallPoints: totalPoints };
    });

    // Sort and assign overall ranks
    finalStandings.sort((a, b) => b.overallPoints - a.overallPoints);
    finalStandings.forEach((s, i) => {
      s.currentRank = i + 1;
    });

    // Sort and assign matchday ranks
    const sortedMd = [...finalStandings].sort((a, b) =>
      (b.matchdays[matchdayNumber] || 0) - (a.matchdays[matchdayNumber] || 0)
    );
    sortedMd.forEach((s, i) => {
      s.mdRanks = { ...s.mdRanks, [matchdayNumber]: i + 1 };
    });

    // Save updated league
    await OverallLeague.findByIdAndUpdate(league._id, {
      $set: { standings: sortedMd, entrants: [] },
    });

    // Bulk update manager matchday ranks
    const bulkOps_md = [];
    for (const s of sortedMd) {
      const manager = infoMap[s.user];
      const managerLivePicks = await ManagerLive.findOne({ manager: manager?._id }).lean();
      const currentLivePicks = managerLivePicks?.livePicks?.find(x => +x.matchday === +matchdayNumber)
      const newCurrentLives = { ...currentLivePicks, matchdayRank: s.mdRanks[matchdayNumber] }
      const updatedManagerLivePicks = [newCurrentLives, ...managerLivePicks?.livePicks?.filter(x => +x.matchday !== +matchdayNumber)]
      bulkOps_md.push({
        updateOne: {
          filter: { manager: manager?._id },
          update: { $set: { livePicks: updatedManagerLivePicks } }
        }
      })
    }

    if (bulkOps_md.length > 0) await ManagerLive.bulkWrite(bulkOps_md);

    // Bulk update manager ranks
    const bulkOps = [];
    for (const s of finalStandings) {
      const manager = infoMap[s.user];
      if (!manager) continue;
      const [ligi] = manager.overallLeagues || [{}];
      const updatedLigi = {
        ...ligi,
        lastRank: s.lastRank,
        currentRank: s.currentRank,
      };
      bulkOps.push({
        updateOne: {
          filter: { _id: manager._id },
          update: { $set: { "overallLeagues.0": updatedLigi } },
        },
      });
    }
    if (bulkOps.length > 0) await ManagerInfo.bulkWrite(bulkOps);
  }

  res.status(200).json({ message: "Overall tables updated successfully." });
});



const updateTeamTables = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true }).lean();
  if (!matchday) {
    return res.status(404).json({ message: "No current matchday found." });
  }

  const matchdayNumber = matchday.id;
  const teamLeagues = await TeamLeague.find({}).lean();

  for (const league of teamLeagues) {
    const entrantIds = league.entrants || [];
    const oldUserIds = league.standings.map(s => s.user);
    const allUserIds = [...new Set([...entrantIds, ...oldUserIds])];

    // Pull all related manager info at once
    const managerInfos = await ManagerInfo.find({ user: { $in: allUserIds } }).lean();
    const infoMap = Object.fromEntries(managerInfos.map(m => [m.user, m]));

    // Build all updated standings
    const newStandings = [...league.standings]; // start with existing
    for (const entrantId of entrantIds) {
      const info = managerInfos.find(m => m._id.toString() === entrantId.toString());
      if (!info) continue;
      const ligi = info.teamLeagues?.[0] || {};
      newStandings.push({
        user: info.user,
        firstName: info.firstName,
        lastName: info.lastName,
        teamName: info.teamName,
        lastRank: ligi.lastRank || null,
        currentRank: ligi.currentRank || null,
        overallPoints: ligi.overallPoints || 0,
        matchdays: { [matchdayNumber]: ligi.matchdayPoints || 0 },
        mdRanks: {},
      });
    }

    // Update matchday points for all standings
    const finalStandings = newStandings.map(s => {
      const info = infoMap[s.user];
      const mdPoints = info?.matchdayPoints || 0;
      const updatedMd = { ...s.matchdays, [matchdayNumber]: mdPoints };
      const totalPoints = Object.values(updatedMd).reduce((a, b) => a + b, 0);
      return { ...s, matchdays: updatedMd, overallPoints: totalPoints };
    });

    // Sort and assign overall ranks
    finalStandings.sort((a, b) => b.overallPoints - a.overallPoints);
    finalStandings.forEach((s, i) => {
      s.currentRank = i + 1;
    });

    // Sort and assign matchday ranks
    const sortedMd = [...finalStandings].sort((a, b) =>
      (b.matchdays[matchdayNumber] || 0) - (a.matchdays[matchdayNumber] || 0)
    );
    sortedMd.forEach((s, i) => {
      s.mdRanks = { ...s.mdRanks, [matchdayNumber]: i + 1 };
    });

    // Save updated league
    await TeamLeague.findByIdAndUpdate(league._id, {
      $set: { standings: sortedMd, entrants: [] },
    });

    // Bulk update manager ranks
    const bulkOps = [];
    for (const s of finalStandings) {
      const manager = infoMap[s.user];
      if (!manager) continue;
      const [ligi] = manager.teamLeagues || [{}];
      const updatedLigi = {
        ...ligi,
        lastRank: s.lastRank,
        currentRank: s.currentRank,
      };
      bulkOps.push({
        updateOne: {
          filter: { _id: manager._id },
          update: { $set: { "teamLeagues.0": updatedLigi } },
        },
      });
    }
    if (bulkOps.length > 0) await ManagerInfo.bulkWrite(bulkOps);
  }

  res.status(200).json({ message: "Team tables updated successfully." });
});
const updatePrivateTables = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true }).lean();
  if (!matchday) {
    return res.status(404).json({ message: "No current matchday found." });
  }

  const matchdayNumber = matchday.id;
  const privateLeagues = await PrivateLeague.find({}).lean();
  const BATCH_SIZE = 1000;

  for (const league of privateLeagues) {
    const standingsMap = new Map(); // key = user, value = standing object

    // Load existing standings into map
    for (const s of league.standings) {
      standingsMap.set(s.user.toString(), s);
    }

    // Chunk entrants to avoid large queries
    const entrants = league.entrants;
    for (let i = 0; i < entrants.length; i += BATCH_SIZE) {
      const chunk = entrants.slice(i, i + BATCH_SIZE);
      const managerInfos = await ManagerInfo.find({ _id: { $in: chunk } }).lean();

      for (const info of managerInfos) {
        const { user, firstName, lastName, teamName, privateLeagues: [ligi] } = info;
        const matchdayPoints = ligi?.matchdayPoints ?? 0;
        const overallPoints = ligi?.overallPoints ?? 0;
        const lastRank = ligi?.lastRank ?? null;
        const currentRank = ligi?.currentRank ?? null;

        const standing = {
          user,
          firstName,
          lastName,
          teamName,
          lastRank,
          currentRank,
          overallPoints,
          matchdays: { [matchdayNumber]: matchdayPoints },
          mdRanks: {},
        };
        standingsMap.set(user.toString(), standing);
      }
    }

    // Refresh standings from map
    const mergedStandings = Array.from(standingsMap.values());

    // Recalculate matchday totals and overallPoints
    for (const standing of mergedStandings) {
      const updatedMatchdays = {
        ...standing.matchdays,
        [matchdayNumber]: standing.matchdays[matchdayNumber] ?? 0,
      };
      standing.matchdays = updatedMatchdays;
      standing.overallPoints = Object.values(updatedMatchdays).reduce((a, b) => a + b, 0);
    }

    // Sort and assign ranks
    mergedStandings.sort((a, b) => b.overallPoints - a.overallPoints);
    mergedStandings.forEach((standing, index) => {
      standing.lastRank = standing.currentRank ?? null;
      standing.currentRank = index + 1;
    });

    // Assign matchday ranks
    const sortedByMdPoints = [...mergedStandings].sort(
      (a, b) => (b.matchdays[matchdayNumber] ?? 0) - (a.matchdays[matchdayNumber] ?? 0)
    );
    sortedByMdPoints.forEach((standing, index) => {
      standing.mdRanks = {
        ...standing.mdRanks,
        [matchdayNumber]: index + 1,
      };
    });

    // Save final standings and clear entrants
    await PrivateLeague.findByIdAndUpdate(league._id, {
      $set: {
        standings: sortedByMdPoints,
        entrants: [],
      },
    });
  }

  res.status(200).json({ message: "Private tables updated successfully." });
});


const setCurrentAndLastRanks = asyncHandler(async (req, res) => {
  const overallLeagues = await OverallLeague.find({}).lean()
  const teamLeagues = await TeamLeague.find({}).lean()
  const privateLeagues = await League.find({}).lean()

  //Setting current and last ranks for overall leagues
  if (overallLeagues) {
    // Using a for...of loop to ensure proper async handling
    for (let league of overallLeagues) {
      const { standings, _id: leagueId } = league;

      if (standings.length === 0) continue;

      // Update league standings with new lastRank
      const newStandings = standings.map(entry => ({
        ...entry,
        lastRank: entry.currentRank
      }));

      await OverallLeague.findByIdAndUpdate(leagueId, {
        $set: { standings: newStandings }
      });

      // Prepare bulkWrite updates for ManagerInfo
      const bulkOps = newStandings.map(({ user, currentRank, lastRank }) => ({
        updateOne: {
          filter: { user },
          update: {
            $set: {
              "overallLeagues.$[el].currentRank": currentRank,
              "overallLeagues.$[el].lastRank": lastRank
            }
          },
          arrayFilters: [{ "el.id": leagueId }]
        }
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
      const newStandings = standings.map(entry => ({
        ...entry,
        lastRank: entry.currentRank
      }));

      await TeamLeague.findByIdAndUpdate(leagueId, {
        $set: { standings: newStandings }
      });

      // Prepare bulkWrite updates for ManagerInfo
      const bulkOps = newStandings.map(({ user, currentRank, lastRank }) => ({
        updateOne: {
          filter: { user },
          update: {
            $set: {
              "teamLeagues.$[el].currentRank": currentRank,
              "teamLeagues.$[el].lastRank": lastRank
            }
          },
          arrayFilters: [{ "el.id": leagueId }]
        }
      }));
      // Perform all updates in one DB operation
      if (bulkOps.length > 0) {
        await ManagerInfo.bulkWrite(bulkOps, { ordered: false });
      }
    }
  }

  ////Setting current and last ranks for private leagues
  if (privateLeagues) {
    // Using a for...of loop to ensure proper async handling
    for (let league of privateLeagues) {
      const { standings, _id: leagueId } = league;

      if (standings.length === 0) continue;

      // Update league standings with new lastRank
      const newStandings = standings.map(entry => ({
        ...entry,
        lastRank: entry.currentRank
      }));

      await PrivateLeague.findByIdAndUpdate(leagueId, {
        $set: { standings: newStandings }
      });

      // Prepare bulkWrite updates for ManagerInfo
      const bulkOps = newStandings.map(({ user, currentRank, lastRank }) => ({
        updateOne: {
          filter: { user },
          update: {
            $set: {
              "privateLeagues.$[el].currentRank": currentRank,
              "privateLeagues.$[el].lastRank": lastRank
            }
          },
          arrayFilters: [{ "el.id": leagueId }]
        }
      }));
      // Perform all updates in one DB operation
      if (bulkOps.length > 0) {
        await ManagerInfo.bulkWrite(bulkOps, { ordered: false });
      }
    }
  }

  res.status(201).json('All Tables updated')
})

export {
  setLeague,
  setOverallLeague,
  setTeamLeague,
  joinOverallLeague,
  joinPrivateLeague,
  joinTeamLeague,
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
  updateOverallTable,
  updateTeamTables,
  updatePrivateTables,
  setCurrentAndLastRanks
};
