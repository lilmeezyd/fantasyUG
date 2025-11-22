import { useState, useEffect, useMemo } from "react";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetHistoryQuery } from "../slices/playerApiSlice";
import { Modal } from "react-bootstrap";
import { getPm, getPmString } from "../utils/getPm";
import getTime from "../utils/getTime";
const PlayerInfo = (props) => {
  const { showPInfo, handleCloseInfo, player } = props;
  /*const [matchdayAndWord, setMatchdayAndWord] = useState({
    id: "",
    matchday: "669a668a212789c00133c756",
    infoWord: "res",
    realInfo: "",
  });*/
  const [results, setResults] = useState(true);
  const [fixtures, setFixtures] = useState(false);
  const [copyFix, setCopyFix] = useState([]);
  const [copyRes, setCopyRes] = useState([]);
  const [id, setId] = useState(1);
  const [fixId, setFixId] = useState(1);
  const { data: teams } = useGetQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const { data: history } = useGetHistoryQuery(player?._id);
  //const { id, matchday, infoWord, realInfo } = matchdayAndWord;
  const playerTeam = teams?.find(
    (team) => team?._id === player?.playerTeam
  )?.name;
  const shortTeamName = teams?.find(
    (team) => team?._id === player?.playerTeam
  )?.shortName;
  const playerPosition = elementTypes?.find(
    (x) => x?._id === player?.playerPosition
  )?.singularName;
  useEffect(() => {
    const copyFix = player?.fixtures?.length > 0 ? [...player?.fixtures] : [];
    copyFix?.sort((x, y) => (x?.kickOffTime > y?.kickOffTime ? 1 : -1));
    setCopyFix(copyFix);
  }, [player]);

  useEffect(() => {
    const id = matchdays?.find((x) => x.current === true)?.id || 1;
    const mid = matchdays?.find((x) => x.id === id)?._id;
    // === mid?.toString()
    const currentFixtures = player?.fixtures
      ?.filter?.((x) => x.matchday.toString())
      ?.sort((x, y) => (x?.kickOffTime > y?.kickOffTime ? 1 : -1)) || [];
    const fixtureId = currentFixtures[0]?._id?.toString() || 1
    setFixId(fixtureId)
    setId(mid?.toString());
  }, [player]);

  const showHistory = async (md) => {
    setFixId(md);
  };

  const showPlayerHistory = useMemo(() => {
    const hist =
      history?.find((x) => x?.fixture?.toString() === fixId?.toString()) || {};
    return {
      ...copyFix?.find((x) => x._id?.toString() === fixId?.toString()),
      ...hist,
    };
  }, [fixId, copyFix, history]);
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
              <div className="player-info-img">
                <div className="ticker-image">
                  <img src={`../${shortTeamName}.png`} alt="logo" />
                </div>
                <span>{playerTeam}</span>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="player-info-data">
            <div className="player-info-data-t">
              <div className="player-info-data-h">Selected %</div>
              <div>{player?.ownership}</div>
            </div>
            <div className="player-info-data-t">
              <div className="player-info-data-h">Total</div>
              <div>{player?.totalPoints}pts</div>
            </div>
            <div className="player-info-data-t">
              <div className="player-info-data-h">Price</div>
              <div>{player?.nowCost?.toFixed(1)}</div>
            </div>
          </div>
          <div className="player-info-wrapper">
            <div className="games-info-fixtures">
              <div className="playerInfoFix">
                {copyFix
                  ?.sort((x, y) => (x?.kickOffTime > y?.kickOffTime ? 1 : -1))
                  ?.map((x, idx) => {
                    let teamImg =
                      player?.playerTeam === x.teamAway
                        ? teams?.find((tname) => tname._id === x.teamHome)
                            ?.shortName
                        : teams?.find((tname) => tname._id === x.teamAway)
                            ?.shortName;
                    return (
                      <div
                        style={{
                          border: fixId === x._id && 0,
                          background:
                            fixId === x._id && "aquamarine",
                        }}
                        onClick={() => showHistory(x?._id)}
                        className="playerFix"
                        key={idx + 1}
                      >
                        <div className="ticker-image">
                          <img src={`../${teamImg}.png`} alt="logo" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {fixId && (
              <div className="player-info-3">
                <>
                  <div>
                    {
                      matchdays?.find(
                        (y) => y._id === showPlayerHistory?.matchday
                      )?.name
                    }
                  </div>
                  <div className="pf">
                    <div>
                      {player?.playerTeam === showPlayerHistory?.teamAway
                        ? teams?.find(
                            (tname) => tname._id === showPlayerHistory?.teamHome
                          )?.name
                        : teams?.find(
                            (tname) => tname._id === showPlayerHistory?.teamAway
                          )?.name}
                    </div>
                    <div>
                      {player?.playerTeam === showPlayerHistory?.teamHome
                        ? "Home"
                        : "Away"}
                    </div>
                  </div>
                  {typeof showPlayerHistory?.teamHomeScore === "number" &&
                    typeof showPlayerHistory?.teamAwayScore === "number" && (
                      <div>
                        <div>
                          {typeof showPlayerHistory?.teamHomeScore === "number"
                            ? showPlayerHistory?.teamHomeScore
                            : ""}
                          &nbsp;:&nbsp;
                          {typeof showPlayerHistory?.teamHomeScore === "number"
                            ? showPlayerHistory?.teamAwayScore
                            : ""}
                        </div>
                      </div>
                    )}
                  <div>
                    {showPlayerHistory?.kickOffTime === "" ? (
                      ""
                    ) : (
                      <div>
                        {new Date(
                          showPlayerHistory?.kickOffTime
                        ).toDateString()}
                      </div>
                    )}
                    {showPlayerHistory?.kickOffTime === "" ? (
                      ""
                    ) : (
                      <div>
                        {getPmString(showPlayerHistory?.kickOffTime)}
                        {getPm(showPlayerHistory?.kickOffTime)}
                      </div>
                    )}
                  </div>
                </>

                {showPlayerHistory?.stats?.length > 0 && (
                  <div className="player-info-1">
                    <div className="player-info-2">
                      <div>Points</div>
                      <div>{showPlayerHistory?.totalPoints}</div>
                    </div>
                    {showPlayerHistory?.goalsScored ? (
                      <div className="player-info-2">
                        <div>Goals</div>
                        <div>{showPlayerHistory?.goalsScored}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {showPlayerHistory?.assists ? (
                      <div className="player-info-2">
                        <div>Assists</div>
                        <div>{showPlayerHistory?.assists}</div>
                      </div>
                    ) : (
                      " "
                    )}
                    {showPlayerHistory?.bestPlayer ? (
                      <div className="player-info-2">
                        <div>Man of the match</div>
                        <div>{showPlayerHistory?.bestPlayer}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {showPlayerHistory?.yellowCards ? (
                      <div className="player-info-2">
                        <div>Yellow card</div>
                        <div>{showPlayerHistory?.yellowCards}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {showPlayerHistory?.redCards ? (
                      <div className="player-info-2">
                        <div>Red card</div>
                        <div>{showPlayerHistory?.redCards}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {showPlayerHistory?.ownGoals ? (
                      <div className="player-info-2">
                        <div>Own goals</div>
                        <div>{showPlayerHistory?.ownGoals}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {showPlayerHistory?.penaltiesMissed ? (
                      <div className="player-info-2">
                        <div>Penalties missed</div>
                        <div>{showPlayerHistory?.penaltiesMissed}</div>
                      </div>
                    ) : (
                      ""
                    )}
                    {showPlayerHistory?.penaltiesSaved ? (
                      <div className="player-info-2">
                        <div>Penalties saved</div>
                        <div>{showPlayerHistory?.penaltiesSaved}</div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PlayerInfo;
