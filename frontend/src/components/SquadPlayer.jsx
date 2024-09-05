import { useState } from "react";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { Modal, Button } from "react-bootstrap";

const SquadPlayer = (props) => {
  const { baller, posName, removePlayer } = props;
  const [show, setShow] = useState(false);
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const appName = players?.find((player) => player._id === baller._id)?.appName;
  const nowCost = players?.find((player) => player._id === baller._id)?.nowCost;

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
              <div>{nowCost?.toFixed(1)}</div>
            </div>
          </button>
        ) : (
          <button className="player-btn empty-btn">
            <div className="p-holder">{posName}</div>
          </button>
        )} 
      </div>

      {baller?._id && (
        <TransferPopUp
          elementTypes={elementTypes}
          removePlayer={removePlayer}
          players={players}
          handleClose={handleClose}
          show={show}
          baller={baller}
        ></TransferPopUp>
      )}
    </>
  );
};

const TransferPopUp = (props) => {
  const { baller, show, handleClose, players, removePlayer, elementTypes } =
    props;

  const playerDetails = players?.find((player) => player._id === baller?._id);
  let positionObj = elementTypes?.find((x) => x._id === baller?.playerPosition);
  let shortPos = positionObj?.shortName;
  const transferOut = () => {
    removePlayer({ ...baller, shortPos });
    handleClose();
  };

  /*const transferIn = () => {
        addPlayer({_id:playerPos._id,
         playerPosition: playerPos.playerPosition,
         playerTeam: playerPos.playerTeam,
         nowCost: playerPos.nowCost,  shortPos:shortPos}
        )
        //onDispatch(shortPos)
        handleCloseTransfer()
    }*/
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
        <Modal.Title style={{ fontWeight: 500 }}>
          <div className="namesection">
            <span>
              {playerDetails?.firstName}&nbsp;{playerDetails?.secondName}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        <div className="infobuttons">
          <button onClick={transferOut} className="btn-success form-control">
            Remove Player
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SquadPlayer;
