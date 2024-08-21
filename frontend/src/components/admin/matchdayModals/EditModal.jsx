import { Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useGetMatchdayQuery, useEditMatchdayMutation } from "../../../slices/matchdayApiSlice";

const EditModal = (props) => { 
  const { show, closeEdit, resetEdit, matchdayId } = props;
  const { data: matchday } = useGetMatchdayQuery(matchdayId)
  const [data, setData] = useState({ name: "", deadline: "" , time: ''});
  const { name, deadline, time } = data;
  const [ editMatchday ] = useEditMatchdayMutation()

  useEffect(() => {
    setData({ name: matchday?.name, deadline: new Date(matchday?.deadlineTime).toLocaleDateString(), 
      time: new Date(matchday?.time).toTimeString() });
  }, [matchday?.name, matchday?.deadlineTime, matchday?.time]);
  
  const onSubmit = async (e) => {
    e.preventDefault()
    const {elements}  = e.currentTarget
    const name = elements.tname.value
    const date = elements.sname.value
    const time = elements.time.value
    const deadlineTime = date+'/'+time

    if(name && date && time) {
      await editMatchday({id: matchday?._id, name, deadlineTime})
      closeEdit()
      resetEdit()
    }
  }
  if(!matchday) {
    return (
      <section>
        <h4>Matchday not found!</h4>
      </section>
    )
  }
  return (
    <Modal show={show} onHide={closeEdit}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
        <Modal.Title>
          <div className="info-details">Edit Position</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div>
            <form onSubmit={onSubmit} action="">
              <div className="form-group my-2">
                <label className="py-2" htmlFor="tname">Name</label>
                <input
                value={name}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev, name: e.target.value
                  }))
                }}
                 name="tname" id="tname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="sname">Deadline</label>
              <input
              value={deadline}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, deadline: e.target.value
                }))
              }} name="sname" id="sname" className="form-control" type="date" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="time">Deadline</label>
              <input
              value={time}
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
  );
};

export default EditModal;
