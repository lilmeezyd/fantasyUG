import { Modal, Button } from "react-bootstrap"

const StartModal = (props) => {
    const {show, closeStart, cancelStart, startMatchdayNow} = props 
    return (
      <Modal show={show} onHide={closeStart}>
          <Modal.Header style={{ background: "aquamarine" }} closeButton>
              <Modal.Title><div className="info-details">Start Matchday</div></Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="p-2 delete-group">
            <div className="info-details mb-2">Are you sure?</div>
            <div className="delete-buttons mt-2">
              <Button onClick={cancelStart} className="btn-default">Cancel</Button>
              <Button onClick={startMatchdayNow} className="btn-danger">Start</Button>
            </div>
            </div>
            
          </Modal.Body>
      </Modal>
    )
  }

export default StartModal