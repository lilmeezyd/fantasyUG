import { useState, useEffect, useMemo } from "react";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetHistoryQuery } from "../slices/playerApiSlice";
import { Modal } from "react-bootstrap";
const PlayerInfo = (props) => {
  const { showPInfo, handleCloseInfo, player } = props;
  const [matchday, setMatchday] = useState('669a668a212789c00133c756')
  const [results, setResults] = useState(true);
  const [fixtures, setFixtures] = useState(false);
  const [copyFix, setCopyFix] = useState([]);
  const [copyRes, setCopyRes ] = useState([])
  const { data: teams } = useGetQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const { data: history } = useGetHistoryQuery(player?._id)
  const playerTeam = teams?.find(
    (team) => team?._id === player?.playerTeam
  )?.name;
  const playerPosition = elementTypes?.find(
    (x) => x?._id === player?.playerPosition
  )?.singularName;

  useEffect(() => {
    const copyFix = player?.fixtures?.length > 0 ? [...player?.fixtures] : [];
    copyFix?.sort((x, y) => (x?.kickOffTime > y?.kickOffTime ? 1 : -1));
    setCopyRes(copyFix?.filter(x => x?.stats.length > 0));
    setCopyFix(copyFix?.filter(x => x?.stats.length === 0));
  }, [player]);

  const resultsView = () => {
    setResults(true);
    setFixtures(false);
  };
  const fixturesView = () => {
    setResults(false);
    setFixtures(true);
  };
  const showHistory = async (md) => {
    setMatchday(md)
  }

  const showPlayerHistory = useMemo(() => {
    return history?.find(x => x.matchday.toString() === matchday.toString())
  }, [matchday, history])
  console.log(showPlayerHistory)
  return (
    <>
      <Modal show={showPInfo} onHide={handleCloseInfo}>
        <Modal.Header style={{ background: "aquamarine" }} closeButton>
          <Modal.Title style={{ fontWeight: 500 }}>
            <div className="namesection">
              <span>
                {player?.firstName}&nbsp;{player?.secondName}
              </span>
              <span>{playerPosition}</span>
              <span>{playerTeam}</span>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="info-tabs">
            <div
              className={`${results ? "play-class" : "no-play"} py-2`}
              onClick={resultsView}
            >
              Results
            </div>
            <div
              className={`${fixtures ? "play-class" : "no-play"} py-2`}
              onClick={fixturesView}
            >
              Fixtures
            </div>
          </div>
          {fixtures &&
            (copyFix?.length > 0 ? (
              <div className="games-info-fixtures">
                <div style={{ fontWeight: 700 }} className="fix-grid p-2">
                  <div>Date</div>
                  <div className="fdr">GW</div>
                  <div className="fdr">Fixture</div>
                </div>
                <div>
                  {copyFix?.map((x, idx) => {
                    let teamName =
                      player?.playerTeam === x.teamAway
                        ? teams?.find((tname) => tname._id === x.teamHome)?.name
                        : teams?.find((tname) => tname._id === x.teamAway)
                            ?.name;
                    let venue =
                      player?.playerTeam === x.teamAway ? "Away" : "Home";
                    let matchday = matchdays?.find(
                      (y) => y._id === x.matchday
                    )?.id;
                    return (
                      <div
                        style={{ fontWeight: 700 }}
                        className="fix-grid p-2 fix-row"
                        key={idx+1}
                      >
                        <div>
                          {x.kickOffTime === ""
                            ? ""
                            : new Date(x.kickOffTime).toDateString()}
                        </div>
                        <div className="fdr">{matchday}</div>
                        <div className="actual-fixture">
                          <div className="actual-fixture-1">{teamName}</div>
                          <div className="actual-fixture-1">{venue}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="tx-center">Fixtures will appear here!</div>
            ))}
          {results &&
            (player?.results?.length > 0 ? (
              <div className="games-info-fixtures">
                <div style={{ fontWeight: 700 }} className="fix-grid p-2">
                  <div>Date</div>
                  <div className="fdr">GW</div>
                  <div className="fdr">Fixture</div>
                </div>
                <div>
                  {copyRes?.map((x, idx) => {
                    let teamHomeScore = x.teamHomeScore
                    let teamAwayScore = x.teamAwayScore
                    let teamName =
                      player?.playerTeam === x.teamAway
                        ? teams?.find((tname) => tname._id === x.teamHome)?.name
                        : teams?.find((tname) => tname._id === x.teamAway)
                            ?.name;
                    let venue =
                      player?.playerTeam === x.teamAway ? "(A)" : "(H)";
                    let matchday = matchdays?.find(
                      (y) => y._id === x.matchday
                    )?.id;
                    return (
                      <div
                      onClick={() => showHistory(x.matchday)}
                        style={{ fontWeight: 700 }}
                        className="fix-grid p-2 fix-row player-his"
                        key={idx+1}
                      >
                        <div>
                          {x.kickOffTime === ""
                            ? ""
                            : new Date(x.kickOffTime).toDateString()}
                        </div>
                        <div className="fdr">{matchday}</div>
                        <div className="actual-fixture">
                          <div className="actual-fixture-1">
                            <div>{teamName}</div>
                            <div>{venue}</div>
                          </div>
                          <div className="actual-fixture-1">
                          <div className="border" style={{borderRadius: 0.2+'rem'}}>{teamHomeScore}</div>
                          &nbsp;
                          <div className="border" style={{borderRadius: 0.2+'rem'}}>{teamAwayScore}</div>
                        </div>
                        </div>
                        
                      </div>
                    );
                  })}
                </div>
                <div className="player-info-1">
                  <div className="player-info-2">
                    <div>Points</div>
                    <div>{showPlayerHistory?.totalPoints}</div>
                  </div>
                  {showPlayerHistory?.goalsScored ? <div className="player-info-2">
                  <div>Goals</div>
                  <div>{showPlayerHistory?.goalsScored}</div>
                  </div> : ''}
                  {showPlayerHistory?.assists ? <div className="player-info-2">
                  <div>Assists</div>
                  <div>{showPlayerHistory?.assists}</div>
                  </div> : ' '}
                  {showPlayerHistory?.bestPlayer ? <div className="player-info-2">
                  <div>Man of the match</div>
                  <div>{showPlayerHistory?.bestPlayer}</div>
                  </div> : ''}
                  {showPlayerHistory?.yellowCards ? <div className="player-info-2">
                  <div>Yellow card</div>
                  <div>{showPlayerHistory?.yellowCards}</div>
                  </div> : ''}
                  {showPlayerHistory?.redCards ? <div className="player-info-2">
                  <div>Red card</div>
                  <div>{showPlayerHistory?.redCards}</div>
                  </div> : ''}
                  {showPlayerHistory?.ownGoals ? <div className="player-info-2">
                  <div>Own goals</div>
                  <div>{showPlayerHistory?.ownGoals}</div>
                  </div> : ''}
                  {showPlayerHistory?.penaltiesMissed ? <div className="player-info-2">
                  <div>Penalties missed
                  </div>
                  <div>{showPlayerHistory?.penaltiesMissed}</div>
                  </div> : ''}
                  {showPlayerHistory?.penaltiesSaved ? <div className="player-info-2">
                  <div>Penalties saved
                  </div>
                  <div>{showPlayerHistory?.penaltiesSaved}</div>
                  </div> : ''}
                </div>
              </div>
            ) : (
              <div className="tx-center">Results will appear here!</div>
            ))}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PlayerInfo;
