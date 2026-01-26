import { useState, useReducer, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { useGetPlayerQuery } from "../slices/playerApiSlice";
import PlayerInfo from "./PlayerInfo";
const PlayerCard = (props) => {
  const {
    forwardImage,
    playerPos,
    shortName,
    shortPos,
    position,
    team,
    sort,
    bgColor,
    addPlayer,
    removePlayer,
    picks,
    GKP,
    DEF,
    MID,
    FWD,
  } = props;
  const pickIds = picks?.map((x) => x._id);
  const doesExist = pickIds?.includes(playerPos?._id);
  const [show, setShow] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const [showPInfo, setShowPInfo] = useState(false);
  const { data: player } = useGetPlayerQuery(playerPos?._id);

  const handleClose = () => setShow(false);
  const handleClosePop = () => setShowPop(false);

  const handleShowTransfer = () => {
    setShowPop(true);
  };
  const handleCloseTransfer = () => {
    setShowPop(false);
  };

  const getInfo = () => {
    setShowPInfo(true);
    handleClose();
  };

  const handleCloseInfo = () => {
    setShowPInfo(false);
  };

  return (
    <>
      <div className="player-tbh">
        <div className="info">
          <button onClick={getInfo} className="player-info-button-table">
            <svg
              width="6"
              height="13"
              viewBox="0 0 6 13"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              class="yss5pg0"
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
            onClick={handleShowTransfer}
            style={{ fontWeight: `${doesExist ? "200" : "700"}` }}
            className="player-cell btn-table"
          >
            <div className="images">
              <img src={`../shirt_${forwardImage}.svg`} alt={forwardImage} />
            </div>
            <div className="player-cell-info">
              <span className="name-1">{playerPos.appName}</span>
              <div className="player-cell-details">
                <span className="team_name">{shortName}</span>
                <span className="position">{shortPos}</span>
              </div>
            </div>
          </button>
        </div>
        <div className="price money">{playerPos.nowCost.toFixed(1)}</div>
        <div className="points others">
          {sort === "nowCost"
            ? playerPos.totalPoints
            : sort === "ownership"
            ? `${playerPos[sort]}%`
            : playerPos[sort]}
        </div>
      </div>

      <TransferPopUp
        addPlayer={addPlayer}
        GKP={GKP}
        DEF={DEF}
        MID={MID}
        FWD={FWD}
        removePlayer={removePlayer}
        picks={picks}
        team={team}
        position={position}
        shortPos={shortPos}
        playerPos={playerPos}
        handleCloseTransfer={handleCloseTransfer}
        showPop={showPop}
        handleClosePop={handleClosePop}
      ></TransferPopUp>
      <PlayerInfo
        player={player}
        handleCloseInfo={handleCloseInfo}
        showPInfo={showPInfo}
      ></PlayerInfo>
    </>
  );
};

const TransferPopUp = (props) => {
  const {
    showPop,
    handleClosePop,
    playerPos,
    shortPos,
    team,
    addPlayer,
    removePlayer,
    handleCloseTransfer,
    position,
    picks,
    GKP,
    DEF,
    MID,
    FWD,
  } = props;

  const pickIds = picks?.map((x) => x._id);
  const doesExist = pickIds?.includes(playerPos?._id);
  const max = { 1: 2, 2: 5, 3: 5, 4: 3 };
  const pp =
    position === 1 ? GKP : position === 2 ? DEF : position === 3 ? MID : FWD;
  const transferIn = () => {
    addPlayer({
      _id: playerPos._id,
      playerPosition: playerPos.playerPosition,
      playerTeam: playerPos.playerTeam,
      nowCost: playerPos.nowCost,
      shortPos: shortPos,
    });
    handleCloseTransfer();
  };

  const transferOut = () => {
    removePlayer({
      _id: playerPos._id,
      playerPosition: playerPos.playerPosition,
      playerTeam: playerPos.playerTeam,
      nowCost: playerPos.nowCost,
      shortPos: shortPos,
    });
    handleCloseTransfer();
  };

  return (
    <Modal show={showPop} onHide={handleClosePop}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
        <Modal.Title style={{ fontWeight: 500 }}>
          <div className="namesection">
            <span>
              {playerPos.firstName}&nbsp;{playerPos.secondName}
            </span>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-3">
        {/*playersSelected() === 15 && <div className='message'>
        <span className='danger span-msg'>You already have the maximum number of Players in your squad</span>
      </div>*/}
        {playerPos.playerPosition === 1 && GKP === 2 && !doesExist && (
          <div className="message">
            <span className="danger span-msg">
              You already have the maximum number of Goalkeepers in your squad
            </span>
          </div>
        )}
        {playerPos.playerPosition === 2 && DEF === 5 && !doesExist && (
          <div className="message">
            <span className="danger span-msg">
              You already have the maximum number of Defenders in your squad
            </span>
          </div>
        )}
        {playerPos.playerPosition === 3 && MID === 5 && !doesExist && (
          <div className="message">
            <span className="danger span-msg">
              You already have the maximum number of Midfielders in your squad
            </span>
          </div>
        )}
        {playerPos.playerPosition === 4 && FWD === 3 && !doesExist && (
          <div className="message">
            <span className="danger span-msg">
              You already have the maximum number of Forwards in your squad
            </span>
          </div>
        )}
        {doesExist ? (
          <div className="infobuttons">
            <button
              onClick={transferOut}
              className={`btn btn-danger form-control`}
            >
              Remove Player
            </button>
          </div>
        ) : (
          playerPos.playerPosition === position &&
          pp < max[position] && (
            <div className="infobuttons">
              <button
                onClick={transferIn}
                className={`btn btn-success form-control`}
              >
                Add Player
              </button>
            </div>
          )
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PlayerCard;
