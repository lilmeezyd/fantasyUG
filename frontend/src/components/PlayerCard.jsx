import { useState } from "react";
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
    picks, GKP,
    DEF, MID, FWD, errorMsg
  } = props;
  const pickIds = picks?.map(x => x._id)
  const doesExist = pickIds?.includes(playerPos?._id)
  const [show, setShow] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const [ showPInfo, setShowPInfo ] = useState(false)
  const { data: player} = useGetPlayerQuery(playerPos?._id)

  const handleClose = () => setShow(false);
  const handleClosePop = () => setShowPop(false);


  const handleShowTransfer = () => {
    setShowPop(true);
  };
  const handleCloseTransfer = () => {
    setShowPop(false);
  };

  const getInfo = () => {
    setShowPInfo(true)
    handleClose();
  };

  const handleCloseInfo = () => {
    setShowPInfo(false)
  }

  return (
    <>
      <div className="player-tbh">
        <div className="info">
          <button onClick={getInfo} className="player-info-button-table">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-info-square"
              viewBox="0 0 16 16"
            >
              <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
          </button>
        </div>
        <div className="position-table-1">
          <button 
          disabled={doesExist}
            onClick={handleShowTransfer}
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
        <div className="points others">{sort === 'nowCost' ? playerPos.totalPoints : sort === 'ownership' ? `${playerPos[sort]}%` : playerPos[sort]}</div>
      </div>

      <TransferPopUp
        addPlayer={addPlayer}
        GKP={GKP} DEF={DEF} MID={MID} FWD={FWD} errorMsg={errorMsg}
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
    picks,GKP, DEF,MID,FWD,errorMsg
  } = props;

  const pickIds = picks?.map(x => x._id)
  const doesExist = pickIds?.includes(playerPos?._id)

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
    })
    handleCloseTransfer();
  }
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
        {
      playerPos.playerPosition === '669a41e50f8891d8e0b4eb2a' && 
      GKP === 2 && <div className='message'>
         <span className='danger span-msg'>You already have the maximum number of Goalkeepers in your squad</span>
        </div>}
        {
      playerPos.playerPosition ==='669a4831e181cb2ed40c240f' && 
      DEF === 5 && <div className='message'>
         <span className='danger span-msg'>You already have the maximum number of Defenders in your squad</span>
        </div>}
        {
      playerPos.playerPosition === '669a4846e181cb2ed40c2413' && 
      MID === 5 && <div className='message'>
         <span className='danger span-msg'>You already have the maximum number of Midfielders in your squad</span>
        </div>}
        {
      playerPos.playerPosition === '669a485de181cb2ed40c2417' && 
      FWD === 3 && <div className='message'>
         <span className='danger span-msg'>You already have the maximum number of Forwards in your squad</span>
        </div>}<div className="infobuttons">
          <button onClick={doesExist ? transferOut : transferIn} className="btn-success form-control">
            {doesExist ? 'Remove Player' : 'Add Player'}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};



export default PlayerCard;


