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
  async (userObj, manager, overallLeague, req, res) => {
    const managerInfo = await ManagerInfo.findById(manager);
    const oldLeagues = managerInfo ? managerInfo.overallLeagues : [];
    const oldLeaguesIds = oldLeagues.map((x) => x.id);
    const requiredLeague = await OverallLeague.findById(overallLeague);
    const oldEntrants = requiredLeague.entrants;
    const oldEntrantsIds = oldEntrants.map((x) => x.toString());
    const { creator, name, id, startMatchday, endMatchday } = requiredLeague;

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

    //const leagues = [...oldLeagues, newLeague];

    const updatedManagerInfo = await ManagerInfo.findByIdAndUpdate(
      manager,
      { $push: { overallLeagues: newLeague } },
      { new: true }
    );

    if (updatedManagerInfo) {
      await OverallLeague.findByIdAndUpdate(
        overallLeague,
        { $push: { entrants: manager } },
        {
          new: true,
        }
      );

      //res.status(200).json(league);
    }
  }
);

//@desc Join Overall league
//@route PATCH /api/leagues/teamleagues/:id/join
//@access Private
const joinTeamLeague = asyncHandler(async (userObj, manager, playerLeague, req, res) => {
  const managerInfo = await ManagerInfo.findById(manager);
  const oldLeagues = managerInfo ? managerInfo.teamLeagues : [];
  const oldLeaguesIds = oldLeagues.map((x) => x.id);
  const requiredLeague = await TeamLeague.findById(playerLeague);
  const teamLeagues = await TeamLeague.find({});
  const teamLeagueIds = teamLeagues.map((x) => x.id);
  const oldEntrants = requiredLeague.entrants;
  const oldEntrantsIds = oldEntrants.map((x) => x.toString());
  //const entrants = [...oldEntrants, manager];
  const { creator, team, id, startMatchday, endMatchday } = requiredLeague;
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

  const newLeague = {
    creator,
    team,
    id,
    startMatchday,
    endMatchday,
    lastRank: null,
    currentRank: null,
    matchdayPoints: 0,
    overallPoints: 0,
  };

  //const leagues = [...oldLeagues, newLeague];

  const updatedManagerInfo = await ManagerInfo.findByIdAndUpdate(
      manager,
      { $push: { teamLeagues: newLeague } },
      { new: true }
    );

    if (updatedManagerInfo) {
      await TeamLeague.findByIdAndUpdate(
        playerLeague,
        { $push: { entrants: manager } },
        {
          new: true,
        }
      );

      //res.status(200).json(league);
    }

  });

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
    .exec();;
  /*.populate("entrants")
    .sort("overallPoints")
    .sort("matchdayPoints")
    .sort("mgrId");*/
  res.status(200).json(league);
});

//@desc Get an Overall League
//@route GET /api/overallleagues/:id
//@access Private
//@access ADMIN & NORMAL_USER
const getOverallLeague = asyncHandler(async (req, res) => {
  const league = await OverallLeague.findById(req.params.id)
    .populate("entrants")
    .exec();
  res.status(200).json(league);
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
  const overallLeagues = await OverallLeague.find({})
  const matchday = await Matchday.findOne({current: true})
  const { id } = matchday 
  

    if(matchday) {
      async function makeCall (entrant) {
        const response = await ManagerLive.findOne({manager: entrant})
        return response
      }
      async function makeCalls (entrants) {
        const promises = entrants.map(makeCall)
        const responses = await Promise.all(promises)
        return responses
      }
       overallLeagues.forEach(async league => {
        const { standings, entrants } = league
        const a = await makeCalls(entrants)
        const entrantsWithNoLives = a.every(x => x === null)
        if(entrantsWithNoLives === true) {
          if(standings.length > 0) {
            const currentMd = await Matchday.findOne({current: true})
            const updatedLeague = await OverallLeague.findById(league.id).sort({'standings.overallPoints': -1})
            
            const { id } = currentMd
            const sortParam = `standings.matchdays.${id}`
            const updatedByMatchday = await OverallLeague.findById(league.id).sort({sortParam: -1})
            
            // update manager info
            if(updatedByMatchday) {
              const { standings } = updatedByMatchday
              standings.forEach(async (x, idx) => {
                const man = await ManagerInfo.findOne({user: x.user})
                if(man) {
                  const { _id } = man
                  const lives = await ManagerLive.findOne({manager: _id})
                  const { livePicks } = lives
                  const newLives = livePicks.map(live => {
                    const {
                      teamValue, bank, matchday, matchdayId, activeChip, matchdayPoints, picks, _id } = live
                    return live.matchday === id ? {
                      teamValue, bank,
                      picks, _id,
                      matchday, matchdayId, activeChip, matchdayPoints, matchdayRank: idx+1} : live
                    
                  })
                  lives.$set('livePicks', newLives)
                  await lives.save()
                }
              })
            }
            //update league standings
            if(updatedLeague) {
              const { standings } = updatedLeague
              const newStandings = await Promise.all(standings.map(async(x, idx) => {
                const man = await ManagerInfo.findOne({user: x.user})
                const { matchdayPoints} = man
                const mid = {}
                mid[id] = matchdayPoints
                const newMid = {...x.matchdays, ...mid}
                const overallPoints = Object.values(newMid).reduce((a,b) => a+b,0)
                const y = {...x, lastRank: x.currentRank,currentRank: idx+1, matchdays: newMid, overallPoints}
                return y
              }))
              if(newStandings) {
                newStandings.forEach(async x => {
                  const man = await ManagerInfo.findOne({user: x.user})
                  if(man) {
                    const { overallLeagues, _id } = man
                    const newTeamLs = overallLeagues.map(overallLeague => {
                      return overallLeague.id === league.id && {...overallLeague, lastRank: x.lastRank, currentRank: x.currentRank}
                    })
                    
                    man.$set('overallLeagues', newTeamLs)
                    man.$set('matchdayRank', x.currenRank)
                    await man.save()
                  }
                })
                
                updatedLeague.$set('standings', newStandings)
                await updatedLeague.save()
              }
            }
           }
        } else {
          entrants.forEach(async entrant => {
            const entrantHasLives = await ManagerLive.findOne({manager: entrant})
            if(entrantHasLives) {
              const mid = {}
              const managerInfo = await ManagerInfo.findById(entrant)
              const { user, firstName, lastName, teamName, overallLeagues: [ligi] } = managerInfo
                          
              const { lastRank, currentRank, matchdayPoints, overallPoints } = ligi
              mid[id] = matchdayPoints
              await OverallLeague.findByIdAndUpdate(league._id,
                {$pull: {entrants: entrant}, 
                $push: {
                  standings: {user, firstName, lastName, teamName, lastRank, currentRank, overallPoints, 
                    matchdays: mid}
                }},{new: true})
            }
          })
        }
      })
      
      res.status(200).json(`Tables updated`)
    }
})
const updateTeamTables = asyncHandler(async (req, res) => {
  const teamLeagues = await TeamLeague.find({})
  const matchday = await Matchday.findOne({current: true})
  const { id } = matchday

    if(matchday) {
      async function makeCall (entrant) {
        const response = await ManagerLive.findOne({manager: entrant})
        return response
      }
      async function makeCalls (entrants) {
        const promises = entrants.map(makeCall)
        const responses = await Promise.all(promises)
        return responses
      }
       teamLeagues.forEach(async league => {
        const { standings, entrants } = league
        const a = await makeCalls(entrants)
        const entrantsWithNoLives = a.every(x => x === null)
        if(entrantsWithNoLives === true) {
          if(standings.length > 0) {
            const updatedLeague = await TeamLeague.findById(league.id).sort({'standings.overallPoints': -1})
            if(updatedLeague) {
              const { standings } = updatedLeague
              const newStandings = standings.map((x, idx) => {
                const y = {...x, lastRank: x.currentRank, currentRank: idx+1}
                return y
              })
              console.log(newStandings)
              newStandings.forEach(async x => {
                const man = await ManagerInfo.findOne({user: x.user})
                if(man) {
                  const { teamLeagues } = man
                  const newTeamLs = teamLeagues.map(teamLeague => {
                    return teamLeague.id === league.id && {...teamLeague, lastRank: x.lastRank, currentRank: x.currentRank}
                  })
                  man.$set('teamLeagues', newTeamLs)
                  await man.save()
                }
              })
              updatedLeague.$set('standings', newStandings)
              await updatedLeague.save()
            }
           }
        } else {
          entrants.forEach(async entrant => {
            const entrantHasLives = await ManagerLive.findOne({manager: entrant})
            if(entrantHasLives) {
              const mid = {}
              const managerInfo = await ManagerInfo.findById(entrant)
              const { user, firstName, lastName, teamName, teamLeagues: [ligi] } = managerInfo
                          
              const { lastRank, currentRank, matchdayPoints, overallPoints } = ligi
              mid[id] = matchdayPoints
              await TeamLeague.findByIdAndUpdate(league._id,
                {$pull: {entrants: entrant}, 
                $push: {
                  standings: {user, firstName, lastName, teamName, lastRank, currentRank, overallPoints, 
                    matchdays: mid}
                }},{new: true})
                //res.status(200).json(`Tables updated`)
            }
          })
        }
      })
      res.status(200).json(`Tables updated`)
    }
})
const updatePrivateTables = asyncHandler(async (req, res) => {
  const privateLeagues = await League.find({})
  console.log(privateLeagues)
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
  updatePrivateTables
};
