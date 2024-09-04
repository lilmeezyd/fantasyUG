import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPicksQuery, useUpdatePicksMutation } from "../slices/picksSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import getTime from "../utils/getTime";
import getTime1 from "../utils/getTime1"
import { getPm, getPmString } from "../utils/getPm";
import PickPlayer from "./PickPlayer";

const ManagerPicks = (props) => {
  const { teamName } = props;
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: managerPicks } = useGetPicksQuery();
  const { data: positions } = useGetPositionsQuery();
  const { data: matchdays } = useGetMatchdaysQuery()

  const md = matchdays?.find(matchday => matchday?.next === true)

  const goalkeepers = managerPicks?.picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a41e50f8891d8e0b4eb2a" &&
      pick?.multiplier > 0
  );
  const defenders = managerPicks?.picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a4831e181cb2ed40c240f" &&
      pick?.multiplier > 0
  );
  const midfielders = managerPicks?.picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a4846e181cb2ed40c2413" &&
      pick?.multiplier > 0
  );
  const forwards = managerPicks?.picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a485de181cb2ed40c2417" &&
      pick?.multiplier > 0
  );
  const bench = managerPicks?.picks?.filter((pick) => pick.multiplier === 0);
  return (
    <div>
      <div className="pick-team-header p-2">
        <div className="pick-team-name">{teamName}</div>
        <div className="deadline">
          <div>{md?.name}</div>
          <div>Deadline:</div>
          <div>
          {getTime1(md?.deadlineTime)},&nbsp;
          {getPmString(
                          new Date(getTime(md?.deadlineTime)).toLocaleTimeString()
                        )}&nbsp;
                        {getPm(md?.kickOffTime)}
          </div>
        </div>
      </div>
      <div className="no-picks-team">
        <div className="default-player">
          {goalkeepers?.map((x) => (
            <div key={x.slot} className="squad-player">
              <PickPlayer baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {defenders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <PickPlayer baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {midfielders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <PickPlayer baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {forwards?.map((x) => (
            <div key={x.slot} className="squad-player">
              <PickPlayer baller={x} />
            </div>
          ))}
        </div>
        <div className="bench">
          <div className="default-player">
            {bench?.map((x, idx) => (
              <div key={x.slot} className="squad-player">
                <div className="bench-pos">
                  {idx > 0 && idx}.&nbsp;&nbsp;
                  {
                    positions?.find(
                      (position) => position._id === x.playerPosition
                    )?.shortName
                  }
                </div>
                {console.log(x)}
                <PickPlayer baller={x} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPicks;
