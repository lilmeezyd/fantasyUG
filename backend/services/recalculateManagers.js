import ManagerLive from "../models/managerLive.js";
import ManagerInfo from "../models/managerInfoModel.js";
export async function recalculateManagers({ fixtureId, matchdayId, players }) {
  const managers = await ManagerLive.find({
    "livePicks.matchdayId": matchdayId,
    "livePicks.picks._id": { $in: players },
  }).lean();

  if (!managers.length) return;

  const bulkLive = [];
  const bulkInfo = [];

  for (const manager of managers) {
    const md = manager.livePicks.find(
      (p) => p.matchdayId.toString() === matchdayId.toString()
    );

    const updatedPicks = md.picks.map((pick) => {
      if (!players.includes(pick._id.toString())) return pick;
      return {
        ...pick,
        points: pick.points + pick.multiplier, // simplified
      };
    });

    const mdPoints = updatedPicks.reduce(
      (a, b) => a + b.points * b.multiplier,
      0
    );

    bulkLive.push({
      updateOne: {
        filter: { _id: manager._id },
        update: {
          $set: {
            "livePicks.$[md].picks": updatedPicks,
            "livePicks.$[md].matchdayPoints": mdPoints,
          },
        },
        arrayFilters: [{ "md.matchdayId": matchdayId }],
      },
    });

    bulkInfo.push({
      updateOne: {
        filter: { _id: manager.manager },
        update: { $inc: { overallPoints: mdPoints } },
      },
    });
  }

  await ManagerLive.bulkWrite(bulkLive);
  await ManagerInfo.bulkWrite(bulkInfo);
}
