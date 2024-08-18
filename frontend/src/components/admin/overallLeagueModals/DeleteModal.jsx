import { Modal, Button } from "react-bootstrap"

const DeleteModal = (props) => {
  const {show, closeDelete, cancelDelete, deleteOverallLeagueNow} = props
  return (
    <Modal show={show} onHide={closeDelete}>
        <Modal.Header style={{ background: "aquamarine" }} closeButton>
            <Modal.Title><div className="info-details">Delete Overall League</div></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-2 delete-group">
          <div className="info-details mb-2">Are you sure?</div>
          <div className="delete-buttons mt-2">
            <Button onClick={cancelDelete} className="btn-default">Cancel</Button>
            <Button onClick={deleteOverallLeagueNow} className="btn-danger">Delete</Button>
          </div>
          </div>
          
        </Modal.Body>
    </Modal>
  )
}

export default DeleteModal