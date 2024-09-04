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
import PickPlayer from "./PickPlayer";

const ManagerPicks = (props) => {
  const { teamName, switchPlayer,switchCaptain,
  switchVice, inform, picks, blocked, okayed, switcher } = props;
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: managerPicks } = useGetPicksQuery();
  const [updatePicks] = useUpdatePicksMutation()
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
  );
  const midfielders = picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a4846e181cb2ed40c2413" &&
      pick?.multiplier > 0
  );
  const forwards = picks?.filter(
    (pick) =>
      pick?.playerPosition === "669a485de181cb2ed40c2417" &&
      pick?.multiplier > 0
  );
  const bench = picks?.filter((pick) => pick.multiplier === 0);

  const onSave = async (e) => {
    e.preventDefault()
    console.log(picks)
    /*const res = await updatePicks({id: id?._id, picks, teamValue, bank: itb}).unwrap()
    navigate('/pickteam')*/
  }
  return (
    <div>
      <div className="pick-team-header p-2">
        <h4 className="pick-team-name">{teamName}</h4>
        <div className="deadline">
          <h4 className="pick-team-name">{md?.name}</h4>
          <h4 className="pick-team-name">Deadline:</h4>
          <h4 className="pick-team-name">
          {getTime1(md?.deadlineTime)},&nbsp;
          {getPmString(
                          new Date(getTime(md?.deadlineTime)).toLocaleTimeString()
                        )}&nbsp;
                        {getPm(md?.kickOffTime)}
          </h4>
        </div>
      </div>
      <div className="no-picks-team">
        <div className="default-player">
          {goalkeepers?.map((x) => (
            <div key={x.slot} className="squad-player">
              <PickPlayer blocked={blocked} okayed={okayed} switcher={switcher} slot={x.slot} posName={"GKP"} multiplier={x.multiplier}
              switchCaptain={switchCaptain}
              switchVice={switchVice}
              inform={inform} switchPlayer={switchPlayer} baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {defenders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <PickPlayer
               blocked={blocked} okayed={okayed} switcher={switcher} slot={x.slot} posName={"DEF"} multiplier={x.multiplier}
              switchCaptain={switchCaptain}
              switchVice={switchVice}
              inform={inform} switchPlayer={switchPlayer} baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {midfielders?.map((x) => (
            <div key={x.slot} className="squad-player">
              <PickPlayer  blocked={blocked} okayed={okayed} switcher={switcher} slot={x.slot} posName={"MID"} multiplier={x.multiplier}
              switchCaptain={switchCaptain}
              switchVice={switchVice}
              inform={inform} switchPlayer={switchPlayer} baller={x} />
            </div>
          ))}
        </div>
        <div className="default-player">
          {forwards?.map((x) => (
            <div key={x.slot} className="squad-player">
              <PickPlayer blocked={blocked} okayed={okayed} switcher={switcher}  slot={x.slot} posName={"FWD"} multiplier={x.multiplier} switchPlayer={switchPlayer}
              switchCaptain={switchCaptain}
              switchVice={switchVice}
              inform={inform} baller={x} />
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
                <PickPlayer blocked={blocked} okayed={okayed} switcher={switcher} slot={x.slot} 
                posName={`${
                  positions?.find(
                    (position) => position._id === x.playerPosition
                  )?.shortName
                }`} multiplier={x.multiplier} switchPlayer={switchPlayer}
                switchCaptain={switchCaptain}
          switchVice={switchVice}
          inform={inform} baller={x} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <section className="form">
        <form onSubmit={onSave}>
        <div className="form-group py-3">
            <Button
              type="submit"
              className="btn-success form-control"
            >
              Save
            </Button>
          </div>
          </form></section>
    </div>
  );
};

export default ManagerPicks;
