import { useState } from "react";
import { useGetPlayersQuery, useGetPlayerQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { Button, Modal } from "react-bootstrap";
import PlayerInfo from "./PlayerInfo";

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
  const nowCost = players?.find((player) => player._id === baller._id)?.nowCost;
  const image = teams?.find((team) => team?._id === baller?.playerTeam)?.code
  const opponentFixArr = mdFixs?.filter(
    (x) => x?.teamAway === baller?.playerTeam || x?.teamHome === baller?.playerTeam
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
  return (
    <>
      <div className="element">
        {baller._id ? (
          <div className="button-wrapper" id={baller._id}>
            <div className="next-fix">&#163;{nowCost?.toFixed(1)}M</div>
          <button 
          style={{borderRadius: '0.5rem', border: `${switcher.slot === baller.slot ? '2px solid goldenrod' : ''}`,
          opacity: `${blocked?.includes(baller.slot) ? '0.6' : '1'}`}}
          className={`${okayed?.includes(baller.slot) ? 'h-light' : ''} player-btn`} onClick={handleShow}>
            <img
              src={`../shirt_${image}-66.svg`}
              className="image_pic"
              alt={appName}
            />
            <div className="captain">
              {baller.IsCaptain ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  role="img"
                  focusable="false"
                  className="captain"
                >
                  <title>Captain</title>
                  <circle cx="12" cy="12" r="12" aria-hidden="true"></circle>
                  <path
                    d="M15.0769667,14.370341 C14.4472145,15.2780796 13.4066319,15.8124328 12.3019667,15.795341 C10.4380057,15.795341 8.92696674,14.284302 8.92696674,12.420341 C8.92696674,10.55638 10.4380057,9.045341 12.3019667,9.045341 C13.3988206,9.06061696 14.42546,9.58781014 15.0769667,10.470341 L17.2519667,8.295341 C15.3643505,6.02401882 12.1615491,5.35094208 9.51934028,6.67031017 C6.87713147,7.98967826 5.49079334,10.954309 6.17225952,13.8279136 C6.8537257,16.7015182 9.42367333,18.7279285 12.3769667,18.720341 C14.2708124,18.7262708 16.0646133,17.8707658 17.2519667,16.395341 L15.0769667,14.370341 Z"
                    fill="#fff"
                    aria-hidden="true"
                  ></path>
                </svg>
              ) : baller.IsViceCaptain ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  role="img"
                  focusable="false"
                  className="vice-captain"
                >
                  <title>Captain</title>
                  <circle cx="12" cy="12" r="12" aria-hidden="true"></circle>
                  <polygon
                    points="13.5 .375 8.925 12.375 4.65 12.375 0 .375 3.15 .375 6.75 10.05 10.35 .375"
                    transform="translate(5.25 6)"
                    fill="#fff"
                    aria-hidden="true"
                  ></polygon>
                </svg>
              ) : baller.IsCaptain ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  role="img"
                  focusable="false"
                  className="captain"
                >
                  <title>Captain</title>
                  <circle
                    cx="12"
                    cy="12"
                    r="12"
                    aria-hidden="true"
                    fill="white"
                  ></circle>
                  <path
                    d="M15.0769667,14.370341 C14.4472145,15.2780796 13.4066319,15.8124328 12.3019667,15.795341 C10.4380057,15.795341 8.92696674,14.284302 8.92696674,12.420341 C8.92696674,10.55638 10.4380057,9.045341 12.3019667,9.045341 C13.3988206,9.06061696 14.42546,9.58781014 15.0769667,10.470341 L17.2519667,8.295341 C15.3643505,6.02401882 12.1615491,5.35094208 9.51934028,6.67031017 C6.87713147,7.98967826 5.49079334,10.954309 6.17225952,13.8279136 C6.8537257,16.7015182 9.42367333,18.7279285 12.3769667,18.720341 C14.2708124,18.7262708 16.0646133,17.8707658 17.2519667,16.395341 L15.0769667,14.370341 Z"
                    fill="#000"
                    aria-hidden="true"
                  ></path>
                </svg>
              ) : baller.IsViceCaptain ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  role="img"
                  focusable="false"
                  className="vice-captain"
                >
                  <title>Captain</title>
                  <circle
                    cx="12"
                    cy="12"
                    r="12"
                    aria-hidden="true"
                    fill="white"
                  ></circle>
                  <polygon
                    points="13.5 .375 8.925 12.375 4.65 12.375 0 .375 3.15 .375 6.75 10.05 10.35 .375"
                    transform="translate(5.25 6)"
                    fill="#000"
                    aria-hidden="true"
                  ></polygon>
                </svg>
              ) : (
                ""
              )}
            </div>
            <div className="player-name">
              <div className="data_name">{appName}</div>
              {opponentArr?.length > 0 && <div className="data_fixtures"
              style={{padding: `${opponentArr?.length === 0 && 0}`,background: `${switcher.slot === baller.slot ? 'goldenrod' : 
                okayed?.includes(baller.slot) ? 'silver' : 'rgba(0, 0, 55, 0.9)'}`}}>
                  {opponentArr?.map((x, idx) => <div key={idx+1}>{x}</div>)}
                </div>}
            </div>
          </button>
          </div>
        ) : (
          <div className="button-wrapper" id={baller._id}>
          <button className="player-btn empty-btn">
            <div className="p-holder">{posName}</div>
          </button>
          </div>
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
  const [ showPInfo, setShowPInfo ] = useState(false)
  const { data: player} = useGetPlayerQuery(baller?._id)
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
    setShowPInfo(true)
    handleClose();
  };

  const handleCloseInfo = () => {
    setShowPInfo(false)
  }

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
          {(switcher._id === baller._id || Object.keys(switcher).length === 0 || 
          okayed?.includes(baller.slot)) && 
          <button onClick={switchOut} className="btn btn-warning form-control my-2">
            {switcher._id === baller._id ? 'Cancel' : 'Switch Player'}
          </button>}
          {(baller.multiplier > 0 && baller.IsCaptain === false && Object.keys(switcher).length === 0) && <button onClick={changeCaptain} className="btn btn-success form-control my-2">
            Captain
          </button>}
          {(baller.multiplier > 0 && baller.IsViceCaptain === false && Object.keys(switcher).length === 0) && <button onClick={changeVice} className="btn btn-primary form-control my-2">
            Vice Captain
          </button>}
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


export default PickPlayer;
