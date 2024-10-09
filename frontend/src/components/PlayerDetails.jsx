import { useState } from "react"
import PlayerInfo from "./PlayerInfo"
import { useGetPlayerQuery } from "../slices/playerApiSlice";
import {useGetPositionsQuery} from "../slices/positionApiSlice"
import {useGetQuery} from "../slices/teamApiSlice"

const PlayerDetails = (props) => {
    const { playerId } = props
    const [ showPInfo, setShowPInfo ] = useState(false)
    const { data: player} = useGetPlayerQuery(playerId)
    const { data: teams } = useGetQuery()
    const { data: positions } = useGetPositionsQuery()

    const handleCloseInfo = () => {
        setShowPInfo(false)
    }
    const show = () => {
        setShowPInfo(true)
    }
  return (
    <>
      <div className="home-name" onClick={show}>{player?.appName}</div>
      <div>
        {positions?.find((x) => x?._id === player?.playerPosition)?.shortName}
      </div>
      <div>{teams?.find((x) => x?._id === player?.playerTeam)?.shortName}</div>

      
    <PlayerInfo
        player={player}
        handleCloseInfo={handleCloseInfo}
        showPInfo={showPInfo}></PlayerInfo>
    </>
  );
};

export default PlayerDetails;
