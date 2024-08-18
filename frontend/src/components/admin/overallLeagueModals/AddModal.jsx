import { Modal, Button } from "react-bootstrap"
import { useState } from "react"
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props 
    const [ data, setData ] = useState({name: '', startMatchday: '', endMatchday: ''})
    const { data: matchdays } = useGetMatchdaysQuery()
    const onSubmit = (e) => {
      e.preventDefault()
      submit(data) 

    }
  return (
    <Modal show={show} onHide={closeAdd}>
        <Modal.Header style={{ background: "aquamarine" }} closeButton>
            <Modal.Title><div className="info-details">Add Overall League</div></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <form onSubmit={onSubmit} action="">
              <div className="form-group my-2">
                <label className="py-2" htmlFor="lname">League Name</label>
                <input
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev, name: e.target.value
                  }))
                }}
                 name="lname" id="lname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="start">Start Matchday</label>
              <select
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, startMatchday: e.target.value
                }))
              }} name="start" id="start" className="form-control">
                {matchdays?.map(matchday => <option key={matchday._id} value={matchday._id}>
                  {matchday.name}
                </option>)}
              </select>
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="end">End matchday</label>
              <select
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, endMatchday: e.target.value
                }))
              }} id="end" name="end" className="form-control">
                {matchdays?.map(matchday => <option key={matchday._id} value={matchday._id}>
                  {matchday.name}
                </option>)}
              </select>
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