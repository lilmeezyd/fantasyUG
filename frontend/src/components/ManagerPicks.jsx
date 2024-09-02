import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPicksQuery, useUpdatePicksMutation } from "../slices/picksSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import PickPlayer from "./PickPlayer";

const ManagerPicks = (props) => {
  const { teamName } = props;
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: managerPicks } = useGetPicksQuery();
  const { data: positions } = useGetPositionsQuery();

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
      <div className="d-flex justify-content-center align-items-center p-2">
        <h1>{teamName}</h1>
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
