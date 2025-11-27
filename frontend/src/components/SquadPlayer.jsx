import { useState } from "react";
import {
  useGetPlayersQuery,
  useGetPlayerQuery,
} from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { Modal, Button, Spinner } from "react-bootstrap";
import PlayerInfo from "./PlayerInfo";

const SquadPlayer = (props) => {
  const {
    baller,
    posName,
    scrollToPlayers,
    removePlayer,
    restore,
    transfersOut,
    transfersIn,
    outMap,
  } = props;
  const [show, setShow] = useState(false);
  const { data: teams, isLoading: teamLoading } = useGetQuery();
  const { data: players, isLoading: playerLoading } = useGetPlayersQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const { data: fixtures, isLoading: fixtureLoading } = useGetFixturesQuery();
  const { data: matchdays } = useGetMatchdaysQuery();

  const outBaller = outMap?.get(baller?.slot) || {};
  const ballerObj = baller._id ? baller : outBaller;
  const appName = players?.find(
    (player) => player._id === ballerObj._id
  )?.appName;
  const nowCost = players?.find(
    (player) => player._id === ballerObj._id
  )?.nowCost;
  const teamCode = teams?.find(
    (team) => team?._id === ballerObj?.playerTeam
  )?.code;
  const image = ballerObj?.playerPosition === 1 ? `${teamCode}_1` : teamCode;
  const mdId = matchdays?.find((matchday) => matchday?.next === true)?.id;
  const mdFixs = fixtures?.find((x) => x?._id?.id === mdId)?.fixtures;
  const opponentFixArr = mdFixs?.filter(
    (x) =>
      x.teamAway === ballerObj?.playerTeam ||
      x.teamHome === ballerObj?.playerTeam
  );

  const opponentArr = opponentFixArr?.map((opponent) =>
    ballerObj?.playerTeam === opponent?.teamAway
      ? `${teams?.find((x) => x._id === opponent?.teamHome)?.shortName}(A)`
      : `${teams?.find((x) => x._id === opponent?.teamAway)?.shortName}(H)`
  );
  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    setShow(true);
  };
  const outIds = transfersOut?.map((x) => x?._id?.toString()) || [];
  const inIds = transfersIn?.map((x) => x?._id?.toString()) || [];

  const jumpToPlayerList = (name) => {
    const codes = { GKP: 1, DEF: 2, MID: 3, FWD: 4 };
    scrollToPlayers(codes[name]);
    setShow(false);
  };

  if (fixtureLoading && teamLoading && playerLoading) {
    return (
      <div className="spinner">
        <Spinner />
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
                {opponentArr?.length > 0 ? (
                  <div
                    style={{ padding: `${opponentArr?.length === 0 && 0}` }}
                    className="data_fixtures"
                  >
                    {opponentArr?.map((x, idx) => (
                      <div key={idx + 1}>{x}</div>
                    ))}
                  </div>
                ) : (
                  <div className="data_fixtures">
                    <div className="blank"></div>
                  </div>
                )}
              </div>
            </button>
          </div>
        ) : (
          <div className="button-wrapper empty-btn">
            {Object.keys(ballerObj)?.length > 0 ? (
              <div className="next-fix">&#163;{nowCost?.toFixed(1)}M</div>
            ) : (
              <div className="next-fix">Price</div>
            )}
            <button onClick={handleShow} className="player-btn">
              <img
                src={`../shirt_0-66.svg`}
                className="image_pic"
                alt="default"
              />
              {Object.keys(ballerObj)?.length > 0 ? (
                <div className="player-name">
                  <div className="data_name">{appName}</div>
                  {opponentArr?.length > 0 ? (
                    <div
                      style={{ padding: `${opponentArr?.length === 0 && 0}` }}
                      className="data_fixtures"
                    >
                      {opponentArr?.map((x, idx) => (
                        <div key={idx + 1}>{x}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="data_fixtures">
                      <div className="blank"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="player-name">
                  <div className="data_name">Name</div>
                  <div
                    style={{ padding: `${opponentArr?.length === 0 && 0}` }}
                    className="data_fixtures"
                  >
                    Fixture
                  </div>
                </div>
              )}
            </button>
            {/*<div className="p-holder">{posName}</div>*/}
          </div>
        )}
      </div>

      {
        <TransferPopUp
          elementTypes={elementTypes}
          removePlayer={removePlayer}
          restore={restore}
          players={players}
          handleClose={handleClose}
          show={show}
          baller={ballerObj}
          transfersOut={transfersOut}
          posName={posName}
          jumpToPlayerList={jumpToPlayerList}
        ></TransferPopUp>
      }
    </>
  );
};

const TransferPopUp = (props) => {
  const {
    baller,
    show,
    handleClose,
    players,
    removePlayer,
    restore,
    elementTypes,
    transfersOut,
    jumpToPlayerList,
    posName,
  } = props;
  const [showPInfo, setShowPInfo] = useState(false);

  const playerDetails = players?.find((player) => player._id === baller?._id);
  let positionObj = elementTypes?.find(
    (x) => x.code === baller?.playerPosition
  );
  const { data: player } = useGetPlayerQuery(baller?._id);
  let shortPos = positionObj?.shortName;
  const outIds = transfersOut?.map((x) => x._id.toString()) || [];
  const doesExist = Object.keys(baller).length
    ? outIds.includes(baller._id.toString())
    : false;
  const restorePlayer = () => {
    const data = { ...baller, shortPos };
    restore({ ...baller, shortPos });
    handleClose();
  };
  const transferOut = () => {
    removePlayer({ ...baller, shortPos });
    handleClose();
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
        <Modal.Body className="">
          <div className="infobuttons">
            {Object.keys(baller).length > 0 && (
              <button
                onClick={doesExist ? restorePlayer : transferOut}
                className={`btn ${
                  doesExist ? "btn-success" : "btn-danger"
                } form-control`}
              >
                {doesExist ? "Restore" : "Remove"} Player
              </button>
            )}
            {doesExist && (
              <button
                className="btn btn-success form-control mt-2"
                onClick={() => jumpToPlayerList(posName)}
              >
                Select Replacement
              </button>
            )}
            {Object.keys(baller).length === 0 && (
              <button
                className="btn btn-success form-control mt-2"
                onClick={() => jumpToPlayerList(posName)}
              >
                Add Player
              </button>
            )}
            {Object.keys(baller).length > 0 && (
              <button
                onClick={getInfo}
                className="btn btn-info form-control my-2"
              >
                Information
              </button>
            )}
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
