import { useMemo } from "react";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
export default function formattedLeagues(leaguesArray) {
  const { data = [] } = useGetMatchdaysQuery();
  const matchdayMap = new Map(data.map((x) => [x._id, x.id]));
  return useMemo(() => {
    return leaguesArray.map((league) => {
      const newDate = new Date(league.createdAt);
      const newTime = newDate.toLocaleTimeString();
      const time =
        newTime.length === 11
          ? newTime.replace(newTime.substring(5, 10), newTime.substring(8, 10))
          : newTime.replace(newTime.substring(4, 9), newTime.substring(7, 9));
      const newDate_1 = new Date(league.updatedAt);
      const newTime_1 = newDate_1.toLocaleTimeString();
      const time_1 =
        newTime_1.length === 11
          ? newTime_1.replace(newTime_1.substring(5, 10), newTime_1.substring(8, 10))
          : newTime_1.replace(newTime_1.substring(4, 9), newTime_1.substring(7, 9));    
      return {
        ...league,
        _id: league._id,
        startMatchday: matchdayMap.get(league.startMatchday),
        endMatchday: matchdayMap.get(league.endMatchday),
        entrants: league.entrants.length,
        standings: league.standings.length,
        createdTime: time,
        createdDate: newDate.toLocaleDateString(),
        updatedTime: time_1,
        updatedDate: newDate_1.toLocaleDateString(),
      };
    });
  }, [matchdayMap, leaguesArray]);
}
