import { useState } from "react";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";

const PickPlayer = (props) => {
  const { baller } = props;
  const [show, setShow] = useState(false);
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const appName = players?.find((player) => player._id === baller._id)?.appName;

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
              <div></div>
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
