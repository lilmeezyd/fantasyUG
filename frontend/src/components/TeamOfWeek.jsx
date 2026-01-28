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
import PlayerDetails from "./PlayerDetails";
import { useGetPlayerQuery } from "../slices/playerApiSlice";
import PlayerInfo from "./PlayerInfo";

const TeamOfWeek = () => {
  const [matchdayId, setMatchdayId] = useState(null);
  const [maxId, setMaxId] = useState(null);
  const [show, setShow] = useState(false);
  const [showPInfo, setShowPInfo] = useState(false);
  //const [ player, setPlayer] = useState('')
  const [ playerId, setPlayerId ] = useState('')
  //const { data: maxId, isLoading } = useGetMaxIdQuery();
  const { data = [], isLoading: getAllLoading } = useGetAllTOWsQuery();
  //const { data: tows } = useGetMatchdayTOWQuery(matchdayId);
  const { data: matchdays = [] } = useGetMatchdaysQuery();
  const { data: teams = [] } = useGetQuery();
  const { data: player = {} } = useGetPlayerQuery(playerId);
  const minId =
    matchdays.length > 0 ? Math.min(...matchdays.map((x) => x.id)) : 1;

  useEffect(() => {
    const myId = Math.max(...data.map((x) => x.matchday)) || 1;
    setMatchdayId(myId);
    setMaxId(myId);
  }, [data]);


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

  /*
  if (isLoading || getAllLoading || !data?.length) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    )
  }*/
  /*console.log(allArray)
  if (data?.length === 0) {
    return (
      <div className="home-section-sub" style={{fontWeight: 800}}>
        No stars of the matchday yet
      </div>
    )
  }*/

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
          {/*<h6 className="home-stars">Stars of Matchday {matchdayId}</h6>*/}
          <div>
            <h4 className="p-2">Stars of Matchday {matchdayId}</h4>
          </div>
          {allArrays?.length === 0 ? (
            <div className="p-2">No stars yet</div>
          ) : (
            <>
              {/*<>

              <div className="default-player">
                {goalkeepers?.map((x) => (
                  <div key={x.id} className="squad-player">
                    <PlayerDetails
                      playerId={x.id}
                      totalPoints={x.totalPoints}
                    />
                  </div>
                ))}
              </div>
              <div className="default-player">
                {defenders?.map((x) => (
                  <div key={x.id} className="squad-player">
                    <PlayerDetails
                      playerId={x.id}
                      totalPoints={x.totalPoints}
                    />
                  </div>
                ))}
              </div>
              <div className="default-player">
                {midfielders?.map((x) => (
                  <div key={x.id} className="squad-player">
                    <PlayerDetails
                      playerId={x.id}
                      totalPoints={x.totalPoints}
                    />
                  </div>
                ))}
              </div>
              <div className="default-player">
                {forwards?.map((x) => (
                  <div key={x.id} className="squad-player">
                    <PlayerDetails
                      playerId={x.id}
                      totalPoints={x.totalPoints}
                    />
                  </div>
                ))}
              </div>
            </>*/}
              <div className="player-header-1">
                <div className="info"></div>
                <div className="position-table-1">
                  <div className="p-t-1">Player</div>
                </div>
                <div className="money"></div>
                <div className="others">Points</div>
              </div>
              {goalkeepers?.map((teamPlayer) => (
                <div key={teamPlayer?.id} className="player-tbh">
                  <div className="info">
                    <button
                      onClick={() => getInfo(teamPlayer?.id)}
                      className="player-info-button-table"
                    >
                      <svg
                        width="6"
                        height="13"
                        viewBox="0 0 6 13"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="yss5pg0"
                        aria-label="Player info"
                      >
                        <path
                          d="M2.22454 5.31004C2.04454 5.79123 1.86735 6.21789 1.72391 6.656C1.26548 8.05608 0.790168 9.45127 0.379072 10.8662C0.141412 11.6841 0.477041 12.237 1.18251 12.338C1.43938 12.3748 1.71688 12.3734 1.96814 12.315C3.51878 11.9549 4.20734 10.674 4.91522 9.41888C4.76334 9.53176 4.64147 9.67574 4.51256 9.81302C4.11552 10.2358 3.67396 10.597 3.1232 10.7888C3.0332 10.8199 2.8996 10.8055 2.82273 10.7548C2.78195 10.728 2.80398 10.5726 2.82695 10.4831C2.85695 10.3645 2.91601 10.2531 2.96241 10.1383C3.56522 8.64782 4.17597 7.1608 4.76385 5.66411C4.86557 5.40486 4.9326 5.09874 4.90589 4.82609C4.85667 4.32769 4.34245 3.97565 3.71245 3.98904C2.07697 4.02348 0.898571 4.85097 0.0595308 6.24002C0.0285936 6.2912 0.0285936 6.36152 0 6.48253C0.698436 5.95686 1.27534 5.32056 2.22454 5.31004ZM5.82634 2.07176C5.82634 2.93942 5.13681 3.64302 4.28602 3.64302C3.43571 3.64302 2.74618 2.93942 2.74618 2.07176C2.74618 1.20362 3.43571 0.5 4.28602 0.5C5.1368 0.5 5.82634 1.2036 5.82634 2.07176Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                    {/*<button
                        className="player-info-button-table"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-info-square"
                          viewBox="0 0 16 16"
                        >
                          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                        </svg>
                      </button>*/}
                  </div>
                  <div className="position-table-1">
                    <button
                      style={{ fontWeight: "700" }}
                      className="player-cell btn-table"
                    >
                      <div className="images">
                        <img
                          src={`../shirt_${teamPlayer.forwardImage}.svg`}
                          alt={teamPlayer.forwardImage}
                        />
                      </div>
                      <div className="player-cell-info">
                        <div className="name-1">{teamPlayer.appName}</div>
                        <div className="player-cell-details">
                          <div className="team_name">
                            {teamPlayer.playerTeam}
                          </div>
                          <div className="position">
                            {teamPlayer.playerPosition}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div></div>
                  <div className="points others">{teamPlayer.totalPoints}</div>
                </div>
              ))}
              {defenders?.map((teamPlayer) => (
                <div key={teamPlayer?.id} className="player-tbh">
                  <div className="info">
                    <button
                      onClick={() => getInfo(teamPlayer?.id)}
                      className="player-info-button-table"
                    >
                      <svg
                        width="6"
                        height="13"
                        viewBox="0 0 6 13"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="yss5pg0"
                        aria-label="Player info"
                      >
                        <path
                          d="M2.22454 5.31004C2.04454 5.79123 1.86735 6.21789 1.72391 6.656C1.26548 8.05608 0.790168 9.45127 0.379072 10.8662C0.141412 11.6841 0.477041 12.237 1.18251 12.338C1.43938 12.3748 1.71688 12.3734 1.96814 12.315C3.51878 11.9549 4.20734 10.674 4.91522 9.41888C4.76334 9.53176 4.64147 9.67574 4.51256 9.81302C4.11552 10.2358 3.67396 10.597 3.1232 10.7888C3.0332 10.8199 2.8996 10.8055 2.82273 10.7548C2.78195 10.728 2.80398 10.5726 2.82695 10.4831C2.85695 10.3645 2.91601 10.2531 2.96241 10.1383C3.56522 8.64782 4.17597 7.1608 4.76385 5.66411C4.86557 5.40486 4.9326 5.09874 4.90589 4.82609C4.85667 4.32769 4.34245 3.97565 3.71245 3.98904C2.07697 4.02348 0.898571 4.85097 0.0595308 6.24002C0.0285936 6.2912 0.0285936 6.36152 0 6.48253C0.698436 5.95686 1.27534 5.32056 2.22454 5.31004ZM5.82634 2.07176C5.82634 2.93942 5.13681 3.64302 4.28602 3.64302C3.43571 3.64302 2.74618 2.93942 2.74618 2.07176C2.74618 1.20362 3.43571 0.5 4.28602 0.5C5.1368 0.5 5.82634 1.2036 5.82634 2.07176Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div className="position-table-1">
                    <button
                      style={{ fontWeight: "700" }}
                      className="player-cell btn-table"
                    >
                      <div className="images">
                        <img
                          src={`../shirt_${teamPlayer.forwardImage}.svg`}
                          alt={teamPlayer.forwardImage}
                        />
                      </div>
                      <div className="player-cell-info">
                        <div className="name-1">{teamPlayer.appName}</div>
                        <div className="player-cell-details">
                          <div className="team_name">
                            {teamPlayer.playerTeam}
                          </div>
                          <div className="position">
                            {teamPlayer.playerPosition}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div></div>
                  <div className="points others">{teamPlayer.totalPoints}</div>
                </div>
              ))}
              {midfielders?.map((teamPlayer) => (
                <div key={teamPlayer?.id} className="player-tbh">
                  <div className="info">
                    <button
                      onClick={() => getInfo(teamPlayer?.id)}
                      className="player-info-button-table"
                    >
                      <svg
                        width="6"
                        height="13"
                        viewBox="0 0 6 13"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="yss5pg0"
                        aria-label="Player info"
                      >
                        <path
                          d="M2.22454 5.31004C2.04454 5.79123 1.86735 6.21789 1.72391 6.656C1.26548 8.05608 0.790168 9.45127 0.379072 10.8662C0.141412 11.6841 0.477041 12.237 1.18251 12.338C1.43938 12.3748 1.71688 12.3734 1.96814 12.315C3.51878 11.9549 4.20734 10.674 4.91522 9.41888C4.76334 9.53176 4.64147 9.67574 4.51256 9.81302C4.11552 10.2358 3.67396 10.597 3.1232 10.7888C3.0332 10.8199 2.8996 10.8055 2.82273 10.7548C2.78195 10.728 2.80398 10.5726 2.82695 10.4831C2.85695 10.3645 2.91601 10.2531 2.96241 10.1383C3.56522 8.64782 4.17597 7.1608 4.76385 5.66411C4.86557 5.40486 4.9326 5.09874 4.90589 4.82609C4.85667 4.32769 4.34245 3.97565 3.71245 3.98904C2.07697 4.02348 0.898571 4.85097 0.0595308 6.24002C0.0285936 6.2912 0.0285936 6.36152 0 6.48253C0.698436 5.95686 1.27534 5.32056 2.22454 5.31004ZM5.82634 2.07176C5.82634 2.93942 5.13681 3.64302 4.28602 3.64302C3.43571 3.64302 2.74618 2.93942 2.74618 2.07176C2.74618 1.20362 3.43571 0.5 4.28602 0.5C5.1368 0.5 5.82634 1.2036 5.82634 2.07176Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div className="position-table-1">
                    <button
                      style={{ fontWeight: "700" }}
                      className="player-cell btn-table"
                    >
                      <div className="images">
                        <img
                          src={`../shirt_${teamPlayer.forwardImage}.svg`}
                          alt={teamPlayer.forwardImage}
                        />
                      </div>
                      <div className="player-cell-info">
                        <div className="name-1">{teamPlayer.appName}</div>
                        <div className="player-cell-details">
                          <div className="team_name">
                            {teamPlayer.playerTeam}
                          </div>
                          <div className="position">
                            {teamPlayer.playerPosition}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div></div>
                  <div className="points others">{teamPlayer.totalPoints}</div>
                </div>
              ))}
              {forwards?.map((teamPlayer) => (
                <div key={teamPlayer?.id} className="player-tbh">
                  <div className="info">
                    <button
                      onClick={() => getInfo(teamPlayer?.id)}
                      className="player-info-button-table"
                    >
                      <svg
                        width="6"
                        height="13"
                        viewBox="0 0 6 13"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="yss5pg0"
                        aria-label="Player info"
                      >
                        <path
                          d="M2.22454 5.31004C2.04454 5.79123 1.86735 6.21789 1.72391 6.656C1.26548 8.05608 0.790168 9.45127 0.379072 10.8662C0.141412 11.6841 0.477041 12.237 1.18251 12.338C1.43938 12.3748 1.71688 12.3734 1.96814 12.315C3.51878 11.9549 4.20734 10.674 4.91522 9.41888C4.76334 9.53176 4.64147 9.67574 4.51256 9.81302C4.11552 10.2358 3.67396 10.597 3.1232 10.7888C3.0332 10.8199 2.8996 10.8055 2.82273 10.7548C2.78195 10.728 2.80398 10.5726 2.82695 10.4831C2.85695 10.3645 2.91601 10.2531 2.96241 10.1383C3.56522 8.64782 4.17597 7.1608 4.76385 5.66411C4.86557 5.40486 4.9326 5.09874 4.90589 4.82609C4.85667 4.32769 4.34245 3.97565 3.71245 3.98904C2.07697 4.02348 0.898571 4.85097 0.0595308 6.24002C0.0285936 6.2912 0.0285936 6.36152 0 6.48253C0.698436 5.95686 1.27534 5.32056 2.22454 5.31004ZM5.82634 2.07176C5.82634 2.93942 5.13681 3.64302 4.28602 3.64302C3.43571 3.64302 2.74618 2.93942 2.74618 2.07176C2.74618 1.20362 3.43571 0.5 4.28602 0.5C5.1368 0.5 5.82634 1.2036 5.82634 2.07176Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div className="position-table-1">
                    <button
                      style={{ fontWeight: "700" }}
                      className="player-cell btn-table"
                    >
                      <div className="images">
                        <img
                          src={`../shirt_${teamPlayer.forwardImage}.svg`}
                          alt={teamPlayer.forwardImage}
                        />
                      </div>
                      <div className="player-cell-info">
                        <div className="name-1">{teamPlayer.appName}</div>
                        <div className="player-cell-details">
                          <div className="team_name">
                            {teamPlayer.playerTeam}
                          </div>
                          <div className="position">
                            {teamPlayer.playerPosition}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                  <div></div>
                  <div className="points others">{teamPlayer.totalPoints}</div>
                </div>
              ))}
            </>
          )}
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
