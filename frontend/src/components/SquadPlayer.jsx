import { useState } from "react";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { Modal, Button } from "react-bootstrap";

const SquadPlayer = (props) => {
  const { baller, posName, removePlayer } = props;
  const [show, setShow] = useState(false);
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: fixtures } = useGetFixturesQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const appName = players?.find((player) => player._id === baller._id)?.appName;
  const nowCost = players?.find((player) => player._id === baller._id)?.nowCost;
  const image = teams?.find((team) => team?._id === baller?.playerTeam)?.code

  const mdId = matchdays?.find((matchday) => matchday?.next === true)?.id;
  const mdFixs = fixtures?.find((x) => x?._id?.id === mdId)?.fixtures;
  const opponentFix = mdFixs?.find(
    (x) => x.teamAway === baller.playerTeam || x.teamHome === baller.playerTeam
  );
  const opponent =
    baller.playerTeam === opponentFix?.teamAway
      ? `${teams?.find((x) => x._id === opponentFix?.teamHome)?.shortName}(A)`
      : `${teams?.find((x) => x._id === opponentFix?.teamAway)?.shortName}(H)`;

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
          <div className="button-wrapper" id={baller._id}>
            <div className="next-fix">&#163;{nowCost?.toFixed(1)}M</div>
          <button onClick={handleShow} className="player-btn player-in-btn">
          <img
              src={`../shirt_${image}-66.svg`}
              className="image_pic"
              alt={appName}
            />
            <div className="player-name">
              <div>{appName}</div>
              <div>{opponent}</div>
            </div>
          </button>
          </div>
        ) : (
          <div className="button-wrapper">
          <button className="player-btn empty-btn">
          <img
              src={`../shirt_0-66.svg`}
              className="image_pic"
              alt='default'
            />
            <div className="p-holder">{posName}</div>
          </button>
          </div>
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
          <button onClick={transferOut} className="btn btn-danger form-control">
            Remove Player
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SquadPlayer;
