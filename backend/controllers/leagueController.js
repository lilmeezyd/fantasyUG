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
    , {session});

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
    , {session});
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
  const overallLeagues = await OverallLeague.find({});
  const matchday = await Matchday.findOne({ current: true });
  const { id } = matchday;

  if (matchday) {
    async function makeCall(entrant) {
      const response = await ManagerLive.findOne({ manager: entrant });
      return response;
    }
    async function makeCalls(entrants) {
      const promises = entrants.map(makeCall);
      const responses = await Promise.all(promises);
      return responses;
    }
    overallLeagues.forEach(async (league) => {
      const { standings, entrants } = league;
      const a = await makeCalls(entrants);
      const entrantsWithNoLives = a.every((x) => x === null);
      if (entrantsWithNoLives === true) {
        if (standings.length > 0) {
          const currentMd = await Matchday.findOne({ current: true });
          const updatedLeague = await OverallLeague.findById(league.id);

          const { id } = currentMd;

          const newStandings = await Promise.all(
            standings.map(async (x, idx) => {
              const man = await ManagerInfo.findOne({ user: x.user });
              const { matchdayPoints } = man;
              const mid = {};
              mid[id] = matchdayPoints;
              const newMid = { ...x.matchdays, ...mid };
              const overallPoints = Object.values(newMid).reduce(
                (a, b) => a + b,
                0
              );
              const y = { ...x, matchdays: newMid, overallPoints };
              return y;
            })
          );

          const superNew = newStandings
            .sort((a, b) => (a.overallPoints > b.overallPoints ? -1 : 1))
            .map((x, idx) => {
              const mid = {};
              mid[id] = idx + 1;
              const newOverallRanks = { ...mid, ...x.managerRanks }
              const lastRank = x.managerRanks === undefined ? null : x.managerRanks[id - 1]
              const y = { ...x, currentRank: idx + 1, lastRank, managerRanks: newOverallRanks };
              return y;
            })
            .sort((a, b) => (a.matchdays[id] > b.matchdays[id] ? -1 : 1))
            .map((x, idx) => {
              const mid = {};
              mid[id] = idx + 1;
              const newMid = { ...x.mdRanks, ...mid };
              const y = { ...x, mdRanks: newMid };
              return y;
            });

          console.log(newStandings)

          updatedLeague.$set("standings", superNew);
          const newUpdated = await updatedLeague.save();
          const { standings: nStands } = newUpdated;
          if (newUpdated) {
            nStands.forEach(async (x) => {
              const man = await ManagerInfo.findOne({ user: x.user });
              if (man) {
                const { _id } = man;
                const lives = await ManagerLive.findOne({ manager: _id });
                const { livePicks } = lives;
                const newLives = livePicks.map((live) => {
                  const {
                    teamValue,
                    bank,
                    automaticSubs,
                    matchday,
                    matchdayId,
                    activeChip,
                    matchdayPoints,
                    picks,
                    _id,
                  } = live;
                  return live.matchday === id
                    ? {
                      teamValue,
                      automaticSubs,
                      bank,
                      picks,
                      _id,
                      matchday,
                      matchdayId,
                      activeChip,
                      matchdayPoints,
                      matchdayRank: x.mdRanks[id],
                    }
                    : live;
                });

                lives.$set("livePicks", newLives);
                await lives.save();
                const { overallLeagues, currentRanks } = man;
                const pcRanks = {}
                pcRanks[id] = x.currentRank
                const newPcRanks = { ...currentRanks, ...pcRanks }
                const newTeamLs = overallLeagues.map((overallLeague) => {
                  return (
                    overallLeague.id === league.id && {
                      ...overallLeague,
                      lastRank: x.lastRank,
                      currentRank: x.currentRank,
                    }
                  );
                });
                man.$set("overallRanks", newPcRanks)
                man.$set("overallLeagues", newTeamLs);
                man.$set("matchdayRank", x.mdRanks[id]);
                man.$set("overallRank", x.currentRank);
                await man.save();
              }
            });
          }
        }
      } else {
        entrants.forEach(async (entrant) => {
          const entrantHasLives = await ManagerLive.findOne({
            manager: entrant,
          });
          if (entrantHasLives) {
            const mid = {};
            const managerInfo = await ManagerInfo.findById(entrant);
            const {
              user,
              firstName,
              lastName,
              teamName,
              overallLeagues: [ligi],
            } = managerInfo;

            const { lastRank, currentRank, matchdayPoints, overallPoints } =
              ligi;
            mid[id] = matchdayPoints;
            await OverallLeague.findByIdAndUpdate(
              league._id,
              {
                $pull: { entrants: entrant },
                $push: {
                  standings: {
                    user,
                    firstName,
                    lastName,
                    teamName,
                    lastRank,
                    currentRank,
                    overallPoints,
                    matchdays: mid,
                    mdRanks: {},
                  },
                },
              },
              { new: true }
            );
          }
        });
      }
    });

    res.status(200).json(`Tables updated`);
  }
});
const updateTeamTables = asyncHandler(async (req, res) => {
  const teamLeagues = await TeamLeague.find({});
  const matchday = await Matchday.findOne({ current: true });
  const { id } = matchday;

  if (matchday) {
    async function makeCall(entrant) {
      const response = await ManagerLive.findOne({ manager: entrant });
      return response;
    }
    async function makeCalls(entrants) {
      const promises = entrants.map(makeCall);
      const responses = await Promise.all(promises);
      return responses;
    }
    teamLeagues.forEach(async (league) => {
      const { standings, entrants } = league;
      const a = await makeCalls(entrants);
      const entrantsWithNoLives = a.every((x) => x === null);
      if (entrantsWithNoLives === true) {
        if (standings.length > 0) {
          const currentMd = await Matchday.findOne({ current: true });
          const updatedLeague = await TeamLeague.findById(league.id);
          const { id } = currentMd;
          const newStandings = await Promise.all(
            standings.map(async (x, idx) => {
              const man = await ManagerInfo.findOne({ user: x.user });
              const { matchdayPoints } = man;
              const mid = {};
              mid[id] = matchdayPoints;
              const newMid = { ...x.matchdays, ...mid };
              const overallPoints = Object.values(newMid).reduce(
                (a, b) => a + b,
                0
              );
              const y = { ...x, matchdays: newMid, overallPoints };
              return y;
            })
          );

          const superNew = newStandings
            .sort((a, b) => (a.overallPoints > b.overallPoints ? -1 : 1))
            .map((x, idx) => {
              const mid = {};
              mid[id] = idx + 1;
              const newOverallRanks = { ...mid, ...x.managerRanks }
              const lastRank = x.managerRanks === undefined ? null : x.managerRanks[id - 1]
              const y = { ...x, currentRank: idx + 1, lastRank, managerRanks: newOverallRanks };
              console.log(y)
              return y
            })
            .sort((a, b) => (a.matchdays[id] > b.matchdays[id] ? -1 : 1))
            .map((x, idx) => {
              const mid = {};
              mid[id] = idx + 1;
              const newMid = { ...x.mdRanks, ...mid };
              const y = { ...x, mdRanks: newMid };
              return y;
            });

          updatedLeague.$set("standings", superNew);
          const newUpdated = await updatedLeague.save();
          const { standings: nStands } = newUpdated;
          if (newUpdated) {
            nStands.forEach(async (x) => {
              const man = await ManagerInfo.findOne({ user: x.user });
              if (man) {
                const { teamLeagues } = man;
                const newTeamLs = teamLeagues
                  .filter((teamLeague) => teamLeague.id === league.id)
                  .map((teamLeague) => {
                    return {
                      ...teamLeague,
                      lastRank: x.lastRank,
                      currentRank: x.currentRank,
                    };
                  });
                man.$set("teamLeagues", newTeamLs);
                await man.save();
              }
            });
          }
        }
      } else {
        entrants.forEach(async (entrant) => {
          const entrantHasLives = await ManagerLive.findOne({
            manager: entrant,
          });
          if (entrantHasLives) {
            const mid = {};
            const managerInfo = await ManagerInfo.findById(entrant);
            const {
              user,
              firstName,
              lastName,
              teamName,
              teamLeagues: [ligi],
            } = managerInfo;

            const { lastRank, currentRank, matchdayPoints, overallPoints } =
              ligi;
            mid[id] = matchdayPoints;
            await TeamLeague.findByIdAndUpdate(
              league._id,
              {
                $pull: { entrants: entrant },
                $push: {
                  standings: {
                    user,
                    firstName,
                    lastName,
                    teamName,
                    lastRank,
                    currentRank,
                    overallPoints,
                    matchdays: mid,
                  },
                },
              },
              { new: true }
            );
            //res.status(200).json(`Tables updated`)
          }
        });
      }
    });
    res.status(200).json(`Tables updated`);
  }
});
const updatePrivateTables = asyncHandler(async (req, res) => {
  const privateLeagues = await League.find({});
  console.log(privateLeagues);
});

const setCurrentAndLastRanks = asyncHandler(async (req, res) => {
  const overallLeagues = await OverallLeague.find({})
  const teamLeagues = await TeamLeague.find({})
  const privateLeagues = await League.find({})

  //Setting current and last ranks for overall leagues
  if (overallLeagues) {
    for (let i = 0; i < overallLeagues.length; i++) {
      const { standings, _id } = overallLeagues[i]
      const newStand = standings.map(x => {
        return { ...x, lastRank: x.currentRank }
      })
      const updatedOverall = await OverallLeague.findByIdAndUpdate(_id, { $set: { standings: newStand } }, { new: true })
      if (updatedOverall) {
        const { standings: newStandz } = updatedOverall
        newStandz.forEach(async stand => {
          const { user, lastRank, currentRank } = stand
          const managerExists = await ManagerInfo.findOne({ user: user })
          if (managerExists) {
            const { overallLeagues } = managerExists
            const requiredLeague = overallLeagues.find(league => league.id.toString() === _id.toString())
            const indexOfLeague = overallLeagues.findIndex(league => league.id.toString() === _id.toString())
            const newRequired = { ...requiredLeague, lastRank, currentRank }
            overallLeagues.splice(indexOfLeague, 1, newRequired)
            await ManagerInfo.findOneAndUpdate({ user: user },
              { $set: { overallLeagues: overallLeagues } },
              { new: true })
          }
        })
      }
    }
  }
  //Setting current and last ranks for team leagues
  if (teamLeagues) {
    for (let i = 0; i < teamLeagues.length; i++) {
      const { standings, _id } = teamLeagues[i]
      const newStand = standings.map(x => {
        return { ...x, lastRank: x.currentRank }
      })
      const updatedTeam = await TeamLeague.findByIdAndUpdate(_id, { $set: { standings: newStand } }, { new: true })
      if (updatedTeam) {
        const { standings: newStandz } = updatedTeam
        newStandz.forEach(async stand => {
          const { user, lastRank, currentRank } = stand
          const managerExists = await ManagerInfo.findOne({ user: user })
          if (managerExists) {
            const { teamLeagues } = managerExists
            const requiredLeague = teamLeagues.find(league => league.id.toString() === _id.toString())
            const indexOfLeague = teamLeagues.findIndex(league => league.id.toString() === _id.toString())
            const newRequired = { ...requiredLeague, lastRank, currentRank }
            teamLeagues.splice(indexOfLeague, 1, newRequired)
            await ManagerInfo.findOneAndUpdate({ user: user },
              { $set: { teamLeagues: teamLeagues } },
              { new: true })
          }
        })
      }
    }
  }

  ////Setting current and last ranks for private leagues
  if (privateLeagues) {
    for (let i = 0; i < privateLeagues.length; i++) {
      const { standings, _id } = privateLeagues[i]
      const newStand = standings.map(x => {
        return { ...x, lastRank: x.currentRank }
      })
      const updatedPrivate = await League.findByIdAndUpdate(_id, { $set: { standings: newStand } }, { new: true })
      if (updatedOverall) {
        const { standings: newStandz } = updatedPrivate
        newStandz.forEach(async stand => {
          const { user, lastRank, currentRank } = stand
          const managerExists = await ManagerInfo.findOne({ user: user })
          if (managerExists) {
            const { privateLeagues } = managerExists
            const requiredLeague = privateLeagues.find(league => league.id.toString() === _id.toString())
            const indexOfLeague = privateLeagues.findIndex(league => league.id.toString() === _id.toString())
            const newRequired = { ...requiredLeague, lastRank, currentRank }
            privateLeagues.splice(indexOfLeague, 1, newRequired)
            await ManagerInfo.findOneAndUpdate({ user: user },
              { $set: { privateLeagues: privateLeagues } },
              { new: true })
          }
        })
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
