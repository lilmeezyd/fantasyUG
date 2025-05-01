import PlayerHistory from "../models/playerHistoryModel.js";
import Player from "../models/playerModel.js";
import ManagerLive from "../models/managerLive.js";
import ManagerInfo from "../models/managerInfoModel.js";
import Matchday from "../models/matchdayModel.js";

async function rollbackFixtureStats(fixtureId, matchdayId, affectedPlayers, allLives) {
    // 1. Delete fixture history
    await PlayerHistory.deleteMany({ fixture: fixtureId });

    // 2. Reverse player stats using bulkWrite
    const bulkUpdates = affectedPlayers.map(play => ({
        updateOne: {
            filter: { _id: play.player },
            update: {
                $inc: {
                    totalPoints: -play.totalPoints,
                    goalsScored: -play.goalsScored,
                    assists: -play.assists,
                    ownGoals: -play.ownGoals,
                    penaltiesSaved: -play.penaltiesSaved,
                    penaltiesMissed: -play.penaltiesMissed,
                    yellowCards: -play.yellowCards,
                    redCards: -play.redCards,
                    saves: -play.saves,
                    cleansheets: -play.cleansheets,
                    starts: -play.starts,
                    bench: -play.bench,
                    bestPlayer: -play.bestPlayer,
                },
            },
        },
    }));
    if (bulkUpdates.length > 0) {
        await Player.bulkWrite(bulkUpdates);
    }

    // 3. Update affected managers
    for (const managerLive of allLives) {
        const updated = await recalculateManagerPicks(managerLive, matchdayId, affectedPlayers);
        if (updated) {
            await recalculateLeaguePoints(managerLive.manager);
        }
    }
}

async function recalculateManagerPicks(managerLive, matchdayId, affectedPlayers) {
    const mLive = await ManagerLive.findOne({ manager: managerLive.manager });
    const mLivePicks = mLive.livePicks;

    const matchdayPick = mLivePicks.find(p => p.matchdayId.toString() === matchdayId.toString());
    if (!matchdayPick) return false;

    const formattedPicks = await Promise.all(
        matchdayPick.picks.map(async (pick) => {
            const playerStats = await PlayerHistory.find({
                matchday: matchdayId,
                player: pick._id,
            });

            const totalPoints = playerStats.reduce((sum, p) => sum + p.totalPoints, 0);
            const affected = affectedPlayers.find(p => p.player.toString() === pick._id.toString());

            if (affected) {
                return {
                    ...pick.toObject?.() ?? pick,
                    points: pick.IsCaptain ? totalPoints * 2 : totalPoints,
                };
            } else {
                return pick;
            }
        })
    );

    const newMatchdayPoints = formattedPicks
        .filter(p => p.multiplier > 0)
        .reduce((sum, p) => sum + (p.points || 0), 0);

    const updatedLivePicks = mLivePicks
        .filter(p => p.matchdayId.toString() !== matchdayId.toString())
        .concat({
            ...matchdayPick,
            picks: formattedPicks,
            matchdayPoints: newMatchdayPoints,
        });

    await ManagerLive.findOneAndUpdate(
        { manager: managerLive.manager },
        { livePicks: updatedLivePicks }
    );

    await ManagerInfo.findOneAndUpdate(
        { _id: managerLive.manager },
        {
            $set: {
                matchdayPoints: newMatchdayPoints,
                "teamLeagues.0.matchdayPoints": newMatchdayPoints,
                "overallLeagues.0.matchdayPoints": newMatchdayPoints,
            },
        }
    );

    return true;
}

async function recalculateLeaguePoints(managerId) {
    const managerInfo = await ManagerInfo.findById(managerId);
    const managerLive = await ManagerLive.findOne({ manager: managerId });

    const { teamLeagues, overallLeagues } = managerInfo;
    const { livePicks } = managerLive;

    const [startTeamMd, endTeamMd, startOverallMd, endOverallMd] = await Promise.all([
        Matchday.findById(teamLeagues[0].startMatchday),
        Matchday.findById(teamLeagues[0].endMatchday),
        Matchday.findById(overallLeagues[0].startMatchday),
        Matchday.findById(overallLeagues[0].endMatchday),
    ]);

    const rangeTotal = (start, end) =>
        livePicks
            .filter(p => p.matchday >= start && p.matchday <= end)
            .reduce((sum, p) => sum + p.matchdayPoints, 0);

    const overallPoints = livePicks.reduce((sum, p) => sum + p.matchdayPoints, 0);
    const teamPoints = rangeTotal(startTeamMd.id, endTeamMd?.id || 100);
    const overallLeaguePoints = rangeTotal(startOverallMd.id, endOverallMd?.id || 100);

    managerInfo.overallPoints = overallPoints;
    managerInfo.teamLeagues[0].overallPoints = teamPoints;
    managerInfo.overallLeagues[0].overallPoints = overallLeaguePoints;
    await managerInfo.save();
}


export { rollbackFixtureStats }