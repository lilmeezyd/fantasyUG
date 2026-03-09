import asyncHandler from "express-async-handler";
import ManagerInfo from "../models/managerInfoModel.js";
import Matchday from "../models/matchdayModel.js";
import User from "../models/userModel.js";
import Picks from "../models/picksModel.js";
import ManagerLive from "../models/managerLive.js";
import Overall from "../models/overallStandingModel.js";
import Weekly from "../models/weeklyStandingModel.js";
import League from "../models/leagueModel.js";

//@desc Get manager info
//@route GET /api/managerinfo/:id
//@access Private
const getManagerInfo = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true });
  const managerInfo = await ManagerInfo.findOne({
    $or: [{ user: req.params.id }, { _id: req.params.id }],
  }).lean();
  if (!managerInfo) {
    res.status(400);
    throw new Error("User not found");
  }
  
  const league = await League.findOne({name: "Overall", leagueType: "Overall"}).lean();
  const teamLeague = await League.find({leagueType: "Team"}).lean();
  const overallLeagues = await Overall.find({manager: managerInfo?._id}).lean()
  const weeklyLeagues = await Weekly.find({manager: managerInfo?._id}).lean()
  const overallLeaguesMap = new Map(overallLeagues.map(x => [x.leagueId.toString(), x]))
  const weeklyLeaguesMap = new Map(weeklyLeagues.map(x => [x.leagueId.toString(), x]))
  const leagueDetails = new Map(teamLeague.map(x => [x._id.toString(), x]))

  const teams = managerInfo.teamLeagues.map(x => x.id)
  const overalls = managerInfo.overallLeagues.map(x => x.id)
  const privates = managerInfo.privateLeagues.map(x => x.id)

  const picks = await Picks.findOne({ manager: managerInfo?._id });
  const managerLive = await ManagerLive.findOne({
    manager: managerInfo?._id,
    matchday: matchday?.id,
  });
  
  res
    .status(200)
    .json({
      ...managerInfo,
      teamLeagues: managerInfo.teamLeagues.map(x => { return {
        id: x,
        name: leagueDetails.get(x.toString())?.name,
        lastRank:
        overallLeaguesMap.get(x.toString())?.oldRank ?? null
        , currentRank: overallLeaguesMap.get(x.toString())?.rank ?? null,
         matchdayPoints: overallLeaguesMap.get(x.toString())?.matchdayPoints ?? null,
          overallPoints: overallLeaguesMap.get(x.toString())?.overallPoints ?? null
      }}),
      overallLeagues: managerInfo.overallLeagues.map(x => { return {
        name: league?.name,
        id: x,
        lastRank:
        overallLeaguesMap.get(x.toString())?.oldRank ?? null
        , currentRank: overallLeaguesMap.get(x.toString())?.rank ?? null,
         matchdayPoints: overallLeaguesMap.get(x.toString())?.matchdayPoints ?? null,
          overallPoints: overallLeaguesMap.get(x.toString())?.overallPoints ?? null
      }}),
      privateLeagues: managerInfo.privateLeagues.map(x => { return {
        lastRank:
        overallLeaguesMap.get(x.toString())?.oldRank ?? null
        , currentRank: overallLeaguesMap.get(x.toString())?.rank ?? null,
         matchdayPoints: overallLeaguesMap.get(x.toString())?.matchdayPoints ?? null,
          overallPoints: overallLeaguesMap.get(x.toString())?.overallPoints ?? null
      }}),
      matchdayPoints: managerLive?.matchdayPoints ?? '-',
      teamValue: picks.teamValue,
      bank: picks.bank,
      overallPoints: overallLeaguesMap.get(league._id.toString())?.overallPoints ?? '-',
      overallRank: overallLeaguesMap.get(league._id.toString())?.rank ?? '-',
      matchdayRank: weeklyLeaguesMap.get(league._id.toString())?.rank ?? '-'
    });
});

export { getManagerInfo };
