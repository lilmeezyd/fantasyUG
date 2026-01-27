import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useMemo } from "react";

export default function fixturesByMatchday(fixturesByMatchday) { 
  const { data = [], isLoading } = useGetMatchdaysQuery();
  const { data: teams = [] } = useGetQuery();
  return useMemo(() => {
    const matchdayMap = new Map(data.map((x) => [x._id, x.id]));
    const matchdayMap2 = new Map(data.map((x) => [x._id, x.deadlineTime]));
    const teamMap = new Map(teams.map((x) => [x._id, x.name]));
    const shortNameMap = new Map(teams.map((x) => [x._id, x.shortName]));
    return fixturesByMatchday.map((fixture) => {
      const getDate = matchdayMap2.get(fixture._id._id);
      const newDate = new Date(getDate);
      const newTime = newDate.toLocaleTimeString();
      const time =
        newTime.length === 11
          ? newTime.replace(newTime.substring(5, 10), newTime.substring(8, 10))
          : newTime.replace(newTime.substring(4, 9), newTime.substring(7, 9));
      return {
        matchday: matchdayMap.get(fixture._id._id),
        deadlineTime: time,
        deadlineDate: newDate.toLocaleDateString(),
        fixtures: fixture.fixtures.map((team) => {
          const newFixDate = new Date(team.kickOffTime);
          const newFixTime = newFixDate.toLocaleTimeString();
          const fixTime =
            newFixTime.length === 11
              ? newFixTime.replace(
                  newFixTime.substring(5, 10),
                  newFixTime.substring(8, 10)
                )
              : newFixTime.replace(
                  newFixTime.substring(4, 9),
                  newFixTime.substring(7, 9)
                );
          return {
            ...team,
            fixTime, fixDate: newFixDate.toLocaleDateString(),
            matchdayId: fixture._id._id,
            teamAwayId: team.teamAway,
            teamHomeId: team.teamHome,
            teamAway: teamMap.get(team.teamAway),
            teamHome: teamMap.get(team.teamHome),
            shortAway: shortNameMap.get(team.teamAway),
            shortHome: shortNameMap.get(team.teamHome),
            matchday: matchdayMap.get(team.matchday),
          };
        }),
      };
    });
  }, [data, teams, fixturesByMatchday]);
}
