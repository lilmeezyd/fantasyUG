import { Modal, Button } from "react-bootstrap";
import { useState } from "react";
const TransferModal = (props) => {
  const {
    show,
    closeTransfers,
    onSave,
    transfersIn,
    transfersOut,
    players,
    teams,
  } = props;
  const [data, setData] = useState({ name: "", shortName: "", code: "" });
  const newTransIn = transfersIn.map((x) => {
    const team = teams.find(
      (team) => team._id.toString() === x.playerTeam.toString()
    );
    return {
      ...x,
      playerPosition:
        x.playerPosition === 1
          ? "GKP"
          : x.playerPosition === 2
          ? "DEF"
          : x.playerPosition === 3
          ? "MID"
          : "FWD",
      forwardImage:
        x.playerPosition === 1 ? `${team.code}_1-66` : `${team.code}-66`,
      playerTeam: teams.find(
        (team) => team._id.toString() === x.playerTeam.toString()
      ).shortName,
      teamCode: teams.find(
        (team) => team._id.toString() === x.playerTeam.toString()
      ).code,
      appName: players.find((player) => player._id === x._id).appName,
    };
  });
  const newTransOut = transfersOut.map((x) => {
    const team = teams.find(
      (team) => team._id.toString() === x.playerTeam.toString()
    );
    return {
      ...x,
      playerPosition:
        x.playerPosition === 1
          ? "GKP"
          : x.playerPosition === 2
          ? "DEF"
          : x.playerPosition === 3
          ? "MID"
          : "FWD",
      forwardImage:
        x.playerPosition === 1 ? `${team.code}_1-66` : `${team.code}-66`,
      playerTeam: teams.find(
        (team) => team._id.toString() === x.playerTeam.toString()
      ).shortName,
      teamCode: teams.find(
        (team) => team._id.toString() === x.playerTeam.toString()
      ).code,
      appName: players.find((player) => player._id === x._id).appName,
    };
  });
  const inMap = new Map(newTransIn.map((x) => [x.slot, x]));
  const outMap = new Map(newTransOut.map((x) => [x.slot, x]));
  const transfers = transfersIn.map((x) => ({
    transferIn: { ...inMap.get(x.slot) },
    transferOut: { ...outMap.get(x.slot) },
  }));
  const onSubmit = (e) => {
    e.preventDefault();
    onSave();
    closeTransfers();
  };
  return (
    <Modal show={show} onHide={closeTransfers}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
        <Modal.Title>
          <div className="info-details">Transfers</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <form onSubmit={onSubmit} action="">
            <div>
              <div style={{fontWeight: 800}} className="transfer-grid">
                <div className="cell">OUT</div>
                <div className="cell">IN</div>
              </div>
              {transfers.map((transfer) => (
                <div className="transfer-grid">
                  <div className="cell">
                    <div className="sub-cell">
                      <div className="cell-name">
                        {transfer.transferOut.appName}
                      </div>
                      <div className="small-cell">
                        <div>{transfer.transferOut.playerPosition}</div>
                        <div>{transfer.transferOut.playerTeam}</div>
                      </div>
                    </div>
                    <div className="image">
                      <img
                        className="image_pic"
                        src={`../shirt_${transfer.transferOut.forwardImage}.svg`}
                        alt={transfer.transferOut.appName}
                      />
                    </div>
                  </div>
                  <div className="cell">
                    <div className="image">
                      <img
                        className="image_pic"
                        src={`../shirt_${transfer.transferIn.forwardImage}.svg`}
                        alt={transfer.transferIn.appName}
                      />
                    </div>
                    <div className="sub-cell">
                      <div className="cell-name">
                        {transfer.transferIn.appName}
                      </div>
                      <div className="small-cell">
                        <div>{transfer.transferIn.playerPosition}</div>
                        <div>{transfer.transferIn.playerTeam}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className=" py-2 my-2">
              <Button type="submit" className="btn-success form-control">
                Submit Transfers
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TransferModal;
