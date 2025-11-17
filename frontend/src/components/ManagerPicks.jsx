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
import {Spinner} from "react-bootstrap";
import { toast } from 'react-toastify';

const ManagerPicks = (props) => {
  const { teamName, switchPlayer,switchCaptain,
    save, setSaveToFalse,
  switchVice, inform, picks, blocked, okayed, switcher, id, isLoading } = props;
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: managerPicks } = useGetPicksQuery();
  const [updatePicks] = useUpdatePicksMutation()
  const { data: positions } = useGetPositionsQuery();
  const { data: matchdays, isLoading: isMatchday } = useGetMatchdaysQuery()
  const navigate = useNavigate();
  const md = matchdays?.find(matchday => matchday?.next === true)

  const goalkeepers = picks?.filter(
    (pick) =>
      pick?.playerPosition === 1 &&
      pick?.multiplier > 0
  );
  const defenders = picks?.filter(
    (pick) =>
      pick?.playerPosition === 2 &&
      pick?.multiplier > 0
  )?.sort((a,b) => a.slot > b.slot ? 1 : -1);
  const midfielders = picks?.filter(
    (pick) =>
      pick?.playerPosition === 3 &&
      pick?.multiplier > 0
  )?.sort((a,b) => a.slot > b.slot ? 1 : -1);
  const forwards = picks?.filter(
    (pick) =>
      pick?.playerPosition === 4 &&
      pick?.multiplier > 0
  )?.sort((a,b) => a.slot > b.slot ? 1 : -1);
  const bench = picks?.filter((pick) => pick.multiplier === 0)?.sort((a,b) => a.slot > b.slot ? 1 : -1);
  const teamValue = picks?.reduce((x,y) => x+(+y.nowCost), 0)
  const itb = 100 - teamValue 

  const onSave = async (e) => {
    e.preventDefault()
    setSaveToFalse()
    const message = await updatePicks({id: id?._id, picks, teamValue, bank: itb}).unwrap()
    toast.success(message?.message)
    navigate('/pickteam')
  }
  if(isLoading) {
    return (
    <div className="spinner">
      <Spinner />
    </div>
    )
  }
  return (
    <div>
      {isMatchday ? <div style={{height : '100px'}} className="spinner">
      <Spinner />
    </div> : <div className="pick-team-header p-2">
    <div className="pt-matchday">
        <div className="pick-team-name">{teamName}</div>
        </div>
        <div className="deadline">
          <div className="pick-team-name">{md?.name}</div>
          <div className="pick-team-name">
          {getTime1(md?.deadlineTime)},&nbsp;
          {getPmString(
                          md?.deadlineTime
                        )}&nbsp;
                        {getPm(md?.deadlineTime)}
          </div>
        </div>
      </div>}
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
          <div className="default-bench">
            {bench?.map((x, idx) => (
              <div key={x.slot} className="squad-player">
                <div className="bench-pos">
                  {idx > 0 && `${idx}.`}&nbsp;&nbsp;
                  {
                    positions?.find(
                      (position) => position.code === x.playerPosition
                    )?.shortName
                  }
                </div>
                <PickPlayer blocked={blocked} okayed={okayed} switcher={switcher} slot={x.slot} 
                posName={`${
                  positions?.find(
                    (position) => position.code === x.playerPosition
                  )?.shortName
                }`} multiplier={x.multiplier} switchPlayer={switchPlayer}
                switchCaptain={switchCaptain}
          switchVice={switchVice}
          inform={inform} baller={x} />
              </div>
            ))}
          </div>
      </div>
      <section className="form">
        <form onSubmit={onSave}>
        <div className="save-picks form-group py-3">
            <Button
              type="submit"
              disabled={ save === false}
              className="primary btn btn-success"
            >
              Save
            </Button>
          </div>
          </form></section>
    </div>
  );
};

export default ManagerPicks;
