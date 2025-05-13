import { useState } from "react"
import PlayerInfo from "./PlayerInfo"
import { useGetPlayerQuery } from "../slices/playerApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice"
import { useGetQuery } from "../slices/teamApiSlice"

const PlayerDetails = (props) => {
  const { playerId, totalPoints } = props
  const [showPInfo, setShowPInfo] = useState(false)
  const { data: player } = useGetPlayerQuery(playerId)
  const { data: teams } = useGetQuery()
  const { data: positions } = useGetPositionsQuery()
  const image = teams?.find((team) => team?._id === player?.playerTeam)?.code;

  const handleCloseInfo = () => {
    setShowPInfo(false)
  }
  const show = () => {
    setShowPInfo(true)
  }
  return (
    <>
      <div className="button-wrapper" id={playerId}>
        <button className="player-btn" onClick={show}>
          <img
            src={`../shirt_${image}-66.svg`}
            className="image_pic"
            alt={player?.appName}
          />
          <div className="home-name">{player?.appName}</div>
          <div className="home-points">{totalPoints}</div>
        </button>
      </div>


      <PlayerInfo
        player={player}
        handleCloseInfo={handleCloseInfo}
        showPInfo={showPInfo}></PlayerInfo>
    </>
  );
};

export default PlayerDetails;
