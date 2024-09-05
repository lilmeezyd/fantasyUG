import { useState } from "react";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { Button, Modal } from "react-bootstrap";

const PickPlayer = (props) => {
  const { baller, posName, switchPlayer, switchCaptain, switchVice, inform, slot, multiplier,
    blocked, okayed, switcher
   } = props;
  const [show, setShow] = useState(false);
  const { data: teams } = useGetQuery();
  const { data: players } = useGetPlayersQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: fixtures } = useGetFixturesQuery();
  const { data: matchdays } = useGetMatchdaysQuery();

  const mdId = matchdays?.find((matchday) => matchday?.next === true)?.id;
  const mdFixs = fixtures?.find((x) => x?._id?.id === mdId)?.fixtures;
  const appName = players?.find((player) => player._id === baller._id)?.appName;
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
          <button 
          style={{border: `${switcher.slot === baller.slot ? '2px solid yellow' : ''}`,
          opacity: `${blocked?.includes(baller.slot) ? '0.6' : '1'}`}}
          className={`${okayed?.includes(baller.slot) ? 'h-light' : ''} player-btn player-in-btn`} onClick={handleShow}>
            <div style={{ fontWeight: 700 }}>
              {(baller.IsCaptain && "C") || (baller.IsViceCaptain && "V")}
            </div>
            <div className="player-name">
              <div>{appName}</div>
              <div
              style={{background: `${switcher.slot === baller.slot ? 'yellow' : 
                okayed?.includes(baller.slot) ? 'red' : '#fff'}`}}>{opponent}</div>
            </div>
          </button>
        ) : (
          <button className="player-btn empty-btn">
            <div className="p-holder">{posName}</div>
          </button>
        )}
      </div>

      {baller?._id && (
        <SwitchPopUp
        blocked={blocked} okayed={okayed} 
        switcher={switcher}
          elementTypes={elementTypes}
          switchPlayer={switchPlayer}
          switchCaptain={switchCaptain}
          switchVice={switchVice}
          inform={inform}
          players={players}
          handleClose={handleClose}
          show={show}
          baller={baller}
        ></SwitchPopUp>
      )}
    </>
  );
};

const SwitchPopUp = (props) => {
  const {
    baller,
    show,
    handleClose,
    players,
    switchPlayer,
    switchCaptain,
    switchVice,
    inform,
    elementTypes,
    blocked,okayed, switcher
  } = props;

  const playerDetails = players?.find((player) => player._id === baller?._id);
  let positionObj = elementTypes?.find((x) => x._id === baller?.playerPosition);
  let shortPos = positionObj?.shortName;
  const switchOut = () => {
    switchPlayer({ ...baller, shortPos});
    handleClose();
  };
  const changeCaptain = () => {
    switchCaptain({ ...baller});
    handleClose();
  };
  const changeVice = () => {
    switchVice({ ...baller});
    handleClose();
  };
  const getInfo = () => {
    inform({ ...baller, shortPos });
    handleClose();
  };

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
          {(switcher._id === baller._id || Object.keys(switcher).length === 0 || 
          okayed?.includes(baller.slot)) && 
          <button onClick={switchOut} className="btn-success form-control my-2">
            {switcher._id === baller._id ? 'Cancel' : 'Switch Player'}
          </button>}
          {(baller.multiplier > 0 && baller.IsCaptain === false && Object.keys(switcher).length === 0) && <button onClick={changeCaptain} className="btn-success form-control my-2">
            Captain
          </button>}
          {(baller.multiplier > 0 && baller.IsViceCaptain === false && Object.keys(switcher).length === 0) && <button onClick={changeVice} className="btn-success form-control my-2">
            Vice Captain
          </button>}
          <button onClick={getInfo} className="btn-success form-control my-2">
            Information
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PickPlayer;
