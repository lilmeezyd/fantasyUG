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

const TeamOfWeek = () => {
  const [matchdayId, setMatchdayId] = useState(null);
  const { data: maxId, isLoading } = useGetMaxIdQuery();
  const { data = [], isLoading: getAllLoading } = useGetAllTOWsQuery();
  //const { data: tows } = useGetMatchdayTOWQuery(matchdayId);
  const { data: matchdays = [] } = useGetMatchdaysQuery();
  const { data: teams = [] } = useGetQuery();
  const minId =
    matchdays.length > 0 ? Math.min(...matchdays.map((x) => x.id)) : 1;

  useEffect(() => {
    setMatchdayId(maxId);
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
            x.position === 'GKP'
              ? `${teamCodeMap.get(x.playerTeam.toString())}_1-66`
              : `${teamCodeMap.get(x.playerTeam.toString())}-66`,
        };
      })
      .sort((a, b) => (a.code > b.code ? 1 : -1));
  }, [matchdayId, data, teams]);
  console.log(allArray)

  const goalkeepers = allArrays?.filter((pick) => pick?.code === 1);
  const defenders = allArrays?.filter((pick) => pick?.code === 2);
  const midfielders = allArrays?.filter((pick) => pick?.code === 3);
  const forwards = allArrays?.filter((pick) => pick?.code === 4);

  const onDecrement = () => {
    setMatchdayId(matchdayId - 1);
  };

  const onIncrement = () => {
    setMatchdayId(matchdayId + 1);
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
              <div class="player-header-1">
                <div class="info"></div>
                <div class="position-table-1">
                  <div class="p-t-1">Player</div>
                </div>
                <div class="money"></div>
                <div class="others">Points</div>
              </div>
              {goalkeepers?.map((teamPlayer) => (
                <div key={teamPlayer?.id} className="player-tbh">
                  <div className="info">
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
              {midfielders?.map((teamPlayer) => (
                <div key={teamPlayer?.id} className="player-tbh">
                  <div className="info">
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
              {forwards?.map((teamPlayer) => (
                <div key={teamPlayer?.id} className="player-tbh">
                  <div className="info">
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default TeamOfWeek;
