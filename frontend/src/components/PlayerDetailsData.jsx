import { useState, useMemo } from "react";
import { useGetPlayerQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice"
import { useGetPositionsQuery } from "../slices/positionApiSlice"
import PlayerInfo from "../components/PlayerInfo";

const PlayerDetailsData = (props) => {
  const { playerId, details, playerData } = props;
  const [show, setShow] = useState(false);
  const [showPInfo, setShowPInfo] = useState(false);
  const { data: teams = [] } = useGetQuery()
  const { data: player } = useGetPlayerQuery(playerId)
  const { data: positions = [] } = useGetPositionsQuery()
 /* const teamCode = teams?.find((team) => team?._id === player?.playerTeam)?.code;
  const playerTeam = teams?.find((team) => team?._id === player?.playerTeam)?.name
  const playerPosition = positions?.find((x) => x?._id === player?.playerPosition)?.shortName
  const image = player?.playerPosition === "669a41e50f8891d8e0b4eb2a" ? `${teamCode}_1` : teamCode;*/
  const memoData = useMemo(() => {
    if (!player) return null;

    const team = teams.find(t => t._id === player.playerTeam);
    const position = positions.find(p => p._id === player.playerPosition);

    return {
      teamCode: team?.code,
      teamName: team?.name,
      positionName: position?.shortName,
      image:
        player.playerPosition === "669a41e50f8891d8e0b4eb2a"
          ? `${team?.code}_1`
          : team?.code,
    };
  }, [player, teams, positions]);
  const handleClose = () => setShow(false);
  const getInfo = () => {
    setShowPInfo(true);
    handleClose();
  };

  const handleCloseInfo = () => {
    setShowPInfo(false);
  };
  return (
    <>
      <div key={player?._id} className="player-tbh">
        <div className="info">
          <button
            onClick={getInfo}
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
                src={`../shirt_${playerData?.forwardImage}.svg`}
                alt={playerData?.forwardImage}
              />
            </div>
            <div className="player-cell-info">
              <div className="name-1">{playerData?.appName}</div>
              <div className="player-cell-details">
                <div className="team_name">{playerData?.playerTeamName || playerData?.playerTeam}</div>
                <div className="position">{playerData?.playerPositionName || playerData?.playerPosition}</div>
              </div>
            </div>
          </button>
        </div>
        <div></div>
        {details === 'highestDetails' && <div className="points others">{playerData?.ownership}%</div>}
        {details === 'transferDetailsOut' && <div className="points others">{playerData.transfersOut}</div>}
        {details === 'transferDetailsIn' && <div className="points others">{playerData.transfersIn}</div>}
        {details === 'starTeam' && <div className="points others">{playerData.totalPoints}</div>}
        {details === 'captaincy' && <div className="points others">{playerData.times}</div>}
      </div>
      <PlayerInfo
        player={player}
        handleCloseInfo={handleCloseInfo}
        showPInfo={showPInfo}
      ></PlayerInfo>
    </>
  );
};

export default PlayerDetailsData;
