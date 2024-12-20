import { useState } from "react";
import {
  useGetPlayersQuery,
  useGetPlayerQuery,
} from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { useGetHistoryQuery } from "../slices/playerApiSlice";
import { Button, Modal, Spinner } from "react-bootstrap";
import PlayerInfo from "./PlayerInfo";

const LivePlayer = (props) => {
  const { baller, posName, slot, multiplier, matchday, matchdayId, teams, players } = props;
  const [show, setShow] = useState(false);
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: fixtures, isLoading } = useGetFixturesQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const { data: history } = useGetHistoryQuery(baller._id)

  const mdFixs = fixtures?.find((x) => x?._id?.id === matchday)?.fixtures;
  const appName = players?.find((player) => player._id === baller._id)?.appName;
  const nowCost = players?.find((player) => player._id === baller._id)?.nowCost;
  const image = teams?.find((team) => team?._id === baller?.playerTeam)?.code;
  const shortName = teams?.find(
    (team) => team?._id === baller?.playerTeam
  )?.shortName;
  const opponentFixArr = mdFixs?.filter(
    (x) => x.teamAway === baller?.playerTeam || x.teamHome === baller?.playerTeam
  )
   /*
  const opponentArr = opponentFixArr?.map(opponent => baller?.playerTeam === opponent?.teamAway
    ? `${teams?.find((x) => x._id === opponent?.teamHome)?.shortName}(A)`
    : `${teams?.find((x) => x._id === opponent?.teamAway)?.shortName}(H)`)*/
    const opponentArr = opponentFixArr?.map(opponent => 
      opponent?.stats?.length === 0 && baller?.playerTeam === opponent?.teamAway ? 
      `${teams?.find((x) => x._id === opponent?.teamHome)?.shortName}(A)`: 
      opponent?.stats?.length === 0 && baller?.playerTeam === opponent?.teamHome ? 
      `${teams?.find((x) => x._id === opponent?.teamAway)?.shortName}(H)`: 
      (baller?.multiplier > 1 ?
        baller?.multiplier * history?.find(x => opponent._id === x.fixture && x.player === baller._id && x.matchday === opponent.matchday)?.totalPoints : 
        history?.find(x => opponent._id === x.fixture && x.player === baller._id && x.matchday === opponent.matchday)?.totalPoints)
    )
  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    setShow(true);
  };
  if(isLoading) {
    return (
    <div className="spinner">
      <Spinner />
    </div>
    )
  }
  return ( 
    <>
      <div className="element">
        {baller._id ? (
          <div className="button-wrapper" id={baller._id}>
            <div className="next-fix">&#163;{nowCost?.toFixed(1)}M</div>
            <button className="player-btn" onClick={handleShow}>
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
                {opponentArr?.length > 0 && <div style={{ fontWeight: 700 }} className="data_fixtures">
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
          elementTypes={elementTypes}
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
  const { baller, show, handleClose, players, elementTypes } = props;

  const playerDetails = players?.find((player) => player._id === baller?._id);
  const [showPInfo, setShowPInfo] = useState(false);
  const { data: player } = useGetPlayerQuery(baller?._id);
  const getInfo = () => {
    setShowPInfo(true);
    handleClose();
  };

  const handleCloseInfo = () => {
    setShowPInfo(false);
  };

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
            <button
              onClick={getInfo}
              className="btn btn-info form-control my-2"
            >
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

export default LivePlayer;
