import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPicksQuery, useUpdatePicksMutation } from "../slices/picksSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import getTime from "../utils/getTime";
import getTime1 from "../utils/getTime1"
import { getPm, getPmString } from "../utils/getPm";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import LivePlayer from "./LivePlayer";
import {Spinner} from "react-bootstrap"; 

const ManagerPicks = (props) => {
  const {picks, isLoading, matchday, matchdayId } = props;
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: positions } = useGetPositionsQuery();
  const { data: matchdays } = useGetMatchdaysQuery()
  const navigate = useNavigate();
  const md = matchdays?.find(matchday => matchday?.next === true)
  const goalkeepers = picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a41e50f8891d8e0b4eb2a" &&
      pick?.multiplier > 0
  );
  const defenders = picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a4831e181cb2ed40c240f" &&
      pick?.multiplier > 0
  )?.sort((a,b) => a.slot > b.slot ? 1 : -1);
  const midfielders = picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a4846e181cb2ed40c2413" &&
      pick?.multiplier > 0
  )?.sort((a,b) => a.slot > b.slot ? 1 : -1);
  const forwards = picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a485de181cb2ed40c2417" &&
      pick?.multiplier > 0
  )?.sort((a,b) => a.slot > b.slot ? 1 : -1);
  const bench = picks?.filter((pick) => pick.multiplier === 0)?.sort((a,b) => a.slot > b.slot ? 1 : -1);
  const teamValue = picks?.reduce((x,y) => x+(+y.nowCost), 0)
  const itb = 100 - teamValue 

  if(isLoading) {
    <div className="spinner">
      <Spinner />
    </div>
  }
  return (
    <div>
      <div className="no-picks-team">
        <div className="default-player">
          {goalkeepers?.map((x) => (
            <div key={x.slot} className="squad-player">
              <LivePlayer 
              matchday={matchday} matchdayId={matchdayId}
              slot={x.slot} posName={"GKP"} multiplier={x.multiplier} baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {defenders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <LivePlayer matchday={matchday} matchdayId={matchdayId} slot={x.slot} posName={"DEF"} multiplier={x.multiplier} baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {midfielders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <LivePlayer matchday={matchday} matchdayId={matchdayId} slot={x.slot} posName={"MID"} multiplier={x.multiplier} baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {forwards?.map((x) => (
            <div key={x.slot} className="squad-player">
              <LivePlayer matchday={matchday} matchdayId={matchdayId} slot={x.slot} posName={"FWD"} multiplier={x.multiplier} baller={x} />
            </div>
          ))}
        </div>
          <div className="default-bench">
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
                <LivePlayer slot={x.slot} 
                matchday={matchday} matchdayId={matchdayId}
                posName={`${
                  positions?.find(
                    (position) => position._id === x.playerPosition
                  )?.shortName
                }`} baller={x} />
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default ManagerPicks;