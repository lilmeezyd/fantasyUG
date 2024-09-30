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
  const [matchdayAndWord, setMatchdayAndWord] = useState({matchday: '669a668a212789c00133c756', infoWord: 'res', 
    realInfo: ''
  })
  const [results, setResults] = useState(true);
  const [fixtures, setFixtures] = useState(false);
  const [copyFix, setCopyFix] = useState([]);
  const [copyRes, setCopyRes ] = useState([])
  const { data: teams } = useGetQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const { data: history } = useGetHistoryQuery(player?._id)
  const { matchday, infoWord, realInfo } = matchdayAndWord
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

  const showHistory = async (md, word, x) => {
    setMatchdayAndWord({matchday: md, infoWord: word, realInfo: x})
  }


  const showPlayerHistory = useMemo(() => {
    if(infoWord === 'res') {
      const results = copyRes?.find(x => x.matchday.toString() === matchday.toString())
      const hist = history?.find(x => x.matchday.toString() === matchday.toString())
    return {...results, ...hist}
    }
    if(infoWord === 'fix') {
      return copyFix?.find(x => x.matchday.toString() === matchday.toString())
    }
  }, [matchday, history, infoWord, copyFix, copyRes])
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
          <div className="player-info-wrapper">
          {
            (player?.results?.length > 0 ? (
              <div className="games-info-fixtures">
                <div className="playerInfoFix">
                  {copyRes?.map((x, idx) => {
                    let teamImg = player?.playerTeam === x.teamAway
                    ? teams?.find((tname) => tname._id === x.teamHome)?.shortName
                    : teams?.find((tname) => tname._id === x.teamAway)
                        ?.shortName;
                        return (
                    <div style={{background : matchday === x.matchday && 'linear-gradient(88deg, aquamarine, #0000ff57)' }} onClick={() => showHistory(x.matchday, 'res', x)} className="playerFix" key={idx+1}>
                    <div className="ticker-image">
        <img src={`../${teamImg}.png`} alt="logo" />
        </div></div>)
                  })}

{
            (copyFix?.length > 0 ? (
                <div>
                  <div className="playerInfoFix">
                  {copyFix?.map((x, idx) => {
                    let teamImg = player?.playerTeam === x.teamAway
                    ? teams?.find((tname) => tname._id === x.teamHome)?.shortName
                    : teams?.find((tname) => tname._id === x.teamAway)
                        ?.shortName;
                  
                    return (
                    <div style={{background : matchday === x.matchday && 'linear-gradient(88deg, aquamarine, #0000ff57)' }} onClick={() => showHistory(x.matchday, 'fix', x)} className="playerFix" key={idx+1}>
                      <div className="ticker-image">
          <img src={`../${teamImg}.png`} alt="logo" />
        </div>
                    </div>)
                  })}
                  </div>
                </div>
                
            ) : (
              ''
            ))}

                </div>
              </div>
            ) : (
              ''
            ))}
          
            <div className="player-info-3">
                  <> 
                  {infoWord === 'fix' && 
                  <>
                  <div>
                  {matchdays?.find(
                    (y) => y._id === showPlayerHistory?.matchday
                  )?.name}
                  </div>
                  <div>
                    <div>
                  {player?.playerTeam === showPlayerHistory?.teamAway
                      ? teams?.find((tname) => tname._id === showPlayerHistory?.teamHome)?.name
                      : teams?.find((tname) => tname._id === showPlayerHistory?.teamAway)
                          ?.name}
                          </div>
                          <div>{player?.playerTeam === showPlayerHistory?.teamAway ? "Away" : "Home"}</div>
                  </div>
                  <div>
                          {showPlayerHistory?.kickOffTime === ""
                            ? ""
                            : <div>{new Date(showPlayerHistory?.kickOffTime).toDateString()}</div>}
                            {showPlayerHistory?.kickOffTime === "" ? "" : 
                            <div>
                            {getPmString(new Date(getTime(showPlayerHistory?.kickOffTime)).toLocaleTimeString())}
                            {getPm(showPlayerHistory?.kickOffTime)}
                            </div>
                            }
                        </div>
                  </>
                  }
                  {infoWord === 'res' && <><div>
                  {matchdays?.find(
                    (y) => y._id === showPlayerHistory?.matchday
                  )?.name}
                  </div>
                  <div className="pf">
                    <div>
                    {player?.playerTeam === showPlayerHistory?.teamAway
                      ? teams?.find((tname) => tname._id === showPlayerHistory?.teamHome)?.name
                      : teams?.find((tname) => tname._id === showPlayerHistory?.teamAway)
                          ?.name}
                          </div>
                          <div>{showPlayerHistory?.home ?  "Home" : "Away" }</div>
                  </div>
                  {typeof(showPlayerHistory?.teamHomeScore)=== 'number' && 
                  typeof(showPlayerHistory?.teamAwayScore) === 'number' && <div>
                    <div>
                    {typeof(showPlayerHistory?.teamHomeScore)=== 'number' ? showPlayerHistory?.teamHomeScore : ''}&nbsp;:&nbsp;
                    {typeof(showPlayerHistory?.teamHomeScore)=== 'number' ? showPlayerHistory?.teamAwayScore : ''}
                    </div>
                  </div>}
                  <div>
                          {showPlayerHistory?.kickOffTime === ""
                            ? ""
                            : <div>{new Date(showPlayerHistory?.kickOffTime).toDateString()}</div>}
                            {showPlayerHistory?.kickOffTime === "" ? "" : 
                            <div>
                            {getPmString(new Date(getTime(showPlayerHistory?.kickOffTime)).toLocaleTimeString())}
                            {getPm(showPlayerHistory?.kickOffTime)}
                            </div>
                            }
                        </div></>}
                  </>


                        {infoWord === 'res' && <div className="player-info-1">
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
                </div>}
                </div>
                
                
                
                
               
            </div>
          
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PlayerInfo;
