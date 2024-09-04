import { useState } from "react";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";

const PickPlayer = (props) => {
  const { baller } = props;
  const [show, setShow] = useState(false);
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: fixtures} = useGetFixturesQuery()
  const { data: matchdays } = useGetMatchdaysQuery()

  const mdId = matchdays?.find(matchday => matchday?.next === true)?.id
  const mdFixs = fixtures?.find(x => x?._id?.id === mdId).fixtures
  const appName = players?.find((player) => player._id === baller._id)?.appName;
  const opponentFix = mdFixs?.find(x => x.teamAway === baller.playerTeam || x.teamHome === baller.playerTeam
  )
  const opponent = baller.playerTeam === opponentFix?.teamAway ? 
  `${teams?.find(x => x._id === opponentFix?.teamHome)?.shortName}(A)` : 
  `${teams?.find(x => x._id === opponentFix?.teamAway)?.shortName}(H)`
  

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    setShow(true);
  };
  return (
    <>
      <div className="element">
        {baller._id ? (
          <button onClick={handleShow} className="player-btn player-in-btn">
            <div className="player-name">
              <div>{appName}</div>
              <div>{opponent}</div>
            </div>
          </button>
        ) : (
          <button className="player-btn empty-btn">
            <div className="p-holder">{posName}</div>
          </button>
        )}
      </div>
    </>
  );
};

export default PickPlayer;
