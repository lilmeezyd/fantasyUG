import { Modal, Button } from "react-bootstrap"
import { useState } from "react"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props
    const [ data, setData ] = useState({name: '', deadline:'', time:''})
    const { deadline, time, name} = data
    const onSubmit = (e) => {
      e.preventDefault() 
     const deadlineTime = deadline+'/'+time
      submit({name, deadlineTime}) 

    }
  return (
    <Modal show={show} onHide={closeAdd}>
        <Modal.Header style={{ background: "aquamarine" }} closeButton>
            <Modal.Title><div className="info-details">Add Matchday</div></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <form onSubmit={onSubmit} action="">
              <div className="form-group my-2">
                <label className="py-2" htmlFor="tname">Name</label>
                <input
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev, name: e.target.value
                  }))
                }}
                 name="tname" id="tname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="sname">Date</label>
              <input
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, deadline: e.target.value
                }))
              }} name="sname" id="sname" className="form-control" type="date" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="time">Time</label>
              <input
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, time: e.target.value
                }))
              }} name="time" id="time" className="form-control" type="time" />
              </div>
              <div className=" py-2 my-2">
                <Button type="submit" className="btn-success form-control">Submit</Button>
              </div>
            </form>
          </div>
        </Modal.Body>
    </Modal>
  )
}

export default AddModal