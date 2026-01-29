import { useEffect, useState, useMemo } from "react";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import {
  useGetAllTOWsQuery,
  useGetMaxIdQuery,
  useGetMatchdayTOWQuery,
} from "../slices/matchdayApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { Spinner } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import PlayerDetailsData from "../components/PlayerDetailsData";
import { useGetPlayerQuery } from "../slices/playerApiSlice";
import PlayerInfo from "./PlayerInfo";

const TeamOfWeek = () => {
  const [matchdayId, setMatchdayId] = useState(null);
  const [show, setShow] = useState(false);
  const [showPInfo, setShowPInfo] = useState(false);
  //const [ player, setPlayer] = useState('')
  const [ playerId, setPlayerId ] = useState('')
  //const { data: maxId, isLoading } = useGetMaxIdQuery();
  const { data= [], isLoading: getAllLoading } = useGetAllTOWsQuery();
  //const { data: tows } = useGetMatchdayTOWQuery(matchdayId);
  const { data: matchdays = [] } = useGetMatchdaysQuery();
  const { data: teams = [] } = useGetQuery();
  const { data: player = {} } = useGetPlayerQuery(playerId);
  const minId = useMemo(
    () => (matchdays.length ? Math.min(...matchdays.map(m => m.id)) : 1),
    [matchdays]
  );

  const maxId = useMemo(
    () => (data.length ? Math.max(...data.map(t => t.matchday)) : 1),
    [data]
  );

  useEffect(() => {
    if (maxId) setMatchdayId(maxId);
  }, [maxId]);


  const allArray = useMemo(
    () => data?.filter((x) => +x.matchday === +matchdayId),
    [matchdayId, data]
  );

  const allArrays = useMemo(() => {
    const teamMap = new Map(teams.map((x) => [x._id.toString(), x.name]));
    const teamCodeMap = new Map(teams.map((x) => [x._id.toString(), x.code]));
    const newOnes = [];
    const all = data?.filter((x) => +x.matchday === +matchdayId);
    if (all !== undefined && all.length > 0) {
      newOnes.push(...all[0].starOnes);
    }
    return newOnes
      .map((x) => {
        return {
          ...x,
          appName: x.player,
          playerTeam: teamMap.get(x.playerTeam.toString()),
          playerPosition: x.position,
          forwardImage:
            x.position === "GKP"
              ? `${teamCodeMap.get(x.playerTeam.toString())}_1-66`
              : `${teamCodeMap.get(x.playerTeam.toString())}-66`,
        };
      })
      .sort((a, b) => (a.code > b.code ? 1 : -1));
  }, [matchdayId, data, teams]);

  const goalkeepers = allArrays?.filter((pick) => pick?.code === 1);
  const defenders = allArrays?.filter((pick) => pick?.code === 2);
  const midfielders = allArrays?.filter((pick) => pick?.code === 3);
  const forwards = allArrays?.filter((pick) => pick?.code === 4);

  const handleClose = () => setShow(false);

  const onDecrement = () => {
    setMatchdayId(matchdayId - 1);
  };

  const onIncrement = () => {
    setMatchdayId(matchdayId + 1);
  };

  const getInfo = (player) => {
    setPlayerId(player)
    setShowPInfo(true);
    handleClose();
  };

  const handleCloseInfo = () => {
    setShowPInfo(false);
  };

   if (getAllLoading) {
    return (
      <p className="text-center font-bold">Loading...</p>
    );
  }

  if (!data.length) {
    return <div>No stars of the matchday yet</div>;
  }

  return (
    <>
      {data?.length === 0 ? (
        <div>No stars of the matchday yet</div>
      ) : (
        <>
        <div className="home-section-sub">
          <section className="btn-wrapper p-2">
            <button
              disabled={matchdayId === minId ? true : false}
              onClick={onDecrement}
              className={`${matchdayId === +minId && "btn-hide"} btn-controls`}
              id="prevButton"
            >
              <BsChevronLeft />
            </button>
            <button
              disabled={matchdayId === +maxId ? true : false}
              onClick={onIncrement}
              className={`${matchdayId === +maxId && "btn-hide"} btn-controls`}
              id="nextButton"
            >
              <BsChevronRight />
            </button>
          </section>
          <div>
            <h4 className="p-2">Stars of Matchday {matchdayId}</h4>
          </div>
          {
            <>
              <div className="player-header-1">
                <div className="info"></div>
                <div className="position-table-1">
                  <div className="p-t-1">Player</div>
                </div>
                <div className="money"></div>
                <div className="others">Points</div>
              </div>
              {goalkeepers?.map((teamPlayer) => (
                <PlayerDetailsData details={'starTeam'} key={teamPlayer?.id} playerData={teamPlayer} playerId={teamPlayer?.id} />
              ))}
              {defenders?.map((teamPlayer) => (
                <PlayerDetailsData details={'starTeam'} key={teamPlayer?.id} playerData={teamPlayer} playerId={teamPlayer?.id} />
              ))}
              {midfielders?.map((teamPlayer) => (
                <PlayerDetailsData details={'starTeam'} key={teamPlayer?.id} playerData={teamPlayer} playerId={teamPlayer?.id} />
              ))}
              {forwards?.map((teamPlayer) => (
                <PlayerDetailsData details={'starTeam'} key={teamPlayer?.id} playerData={teamPlayer} playerId={teamPlayer?.id} />
              ))}
            </>
          }
        </div>
        <PlayerInfo
        player={player}
        handleCloseInfo={handleCloseInfo}
        showPInfo={showPInfo}
      ></PlayerInfo>
      </>
      )
      }
    </>
  );
};

export default TeamOfWeek;
