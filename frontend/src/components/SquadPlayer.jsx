import { useState } from "react";
import { useGetPlayersQuery, useGetPlayerQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { Modal, Button, Spinner } from "react-bootstrap";
import PlayerInfo from "./PlayerInfo";

const SquadPlayer = (props) => {
  const { baller, posName, removePlayer } = props;
  const [show, setShow] = useState(false);
  const { data: teams, isLoading: teamLoading } = useGetQuery();
  const { data: players, isLoading: playerLoading } = useGetPlayersQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: fixtures, isLoading: fixtureLoading } = useGetFixturesQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const appName = players?.find((player) => player._id === baller._id)?.appName;
  const nowCost = players?.find((player) => player._id === baller._id)?.nowCost;
  const image = teams?.find((team) => team?._id === baller?.playerTeam)?.code
  const mdId = matchdays?.find((matchday) => matchday?.next === true)?.id;
  const mdFixs = fixtures?.find((x) => x?._id?.id === mdId)?.fixtures;
  const opponentFixArr = mdFixs?.filter(
    (x) => x.teamAway === baller?.playerTeam || x.teamHome === baller?.playerTeam
  )
  
  const opponentArr = opponentFixArr?.map(opponent => baller?.playerTeam === opponent?.teamAway
    ? `${teams?.find((x) => x._id === opponent?.teamHome)?.shortName}(A)`
    : `${teams?.find((x) => x._id === opponent?.teamAway)?.shortName}(H)`)

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    setShow(true);
  };
  
  if (fixtureLoading && teamLoading && playerLoading) {
    return (
      <div className="spinner">
        <Spinner/>
      </div>
    );
  } 
  return (
    <>
      <div className="element">
        {baller._id ? (
          <div className="button-wrapper" id={baller._id}>
            <div className="next-fix">&#163;{nowCost?.toFixed(1)}M</div>
          <button onClick={handleShow} className="player-btn">
          <img
              src={`../shirt_${image}-66.svg`}
              className="image_pic"
              alt={appName}
            />
            <div className="player-name">
              <div className="data_name">{appName}</div>
              {opponentArr?.length > 0 && <div style={{padding: `${opponentArr?.length === 0 && 0}`}} className="data_fixtures">
              {opponentArr?.map((x, idx) => <div key={idx+1}>{x}</div>)}
              </div>}
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
    const [ showPInfo, setShowPInfo ] = useState(false)

  const playerDetails = players?.find((player) => player._id === baller?._id);
  let positionObj = elementTypes?.find((x) => x._id === baller?.playerPosition);
  const { data: player} = useGetPlayerQuery(baller?._id)
  let shortPos = positionObj?.shortName;
  const transferOut = () => {
    removePlayer({ ...baller, shortPos });
    handleClose();
  };
  const getInfo = () => {
    setShowPInfo(true)
    handleClose();
  };

  const handleCloseInfo = () => {
    setShowPInfo(false)
  }

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
    <>
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
          <button onClick={getInfo} className="btn btn-info form-control my-2">
            Information
          </button>
        </div>
      </Modal.Body>
    </Modal>
    <PlayerInfo
    player={player}
    handleCloseInfo={handleCloseInfo}
    showPInfo={showPInfo}
    ></PlayerInfo>
    </>
  );
};

export default SquadPlayer;
