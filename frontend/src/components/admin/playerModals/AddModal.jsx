import { Modal, Button } from "react-bootstrap"
import { useState  } from "react"
import {  useGetQuery } from "../../../slices/teamApiSlice"
import { useGetPositionsQuery } from "../../../slices/positionApiSlice"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props
    const [ data, setData ] = useState({firstName: '', secondName: '', appName: '',
      playerPosition: '', playerTeam: '', startCost: ''
    })
    //const [ teams, setTeams ] = useState([])

    const { data: teams} = useGetQuery()
    const { data: positions } = useGetPositionsQuery()

    const onSubmit = (e) => {
      e.preventDefault()
      console.log(data)
      submit(data) 

    }
  return (
    <Modal show={show} onHide={closeAdd}>
        <Modal.Header style={{ background: "aquamarine" }} closeButton>
            <Modal.Title><div className="info-details">Add Player</div></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <form onSubmit={onSubmit} action="">
              <div className="form-group my-2">
                <label className="py-2" htmlFor="tname">Player Name</label>
                <input
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev, firstName: e.target.value
                  }))
                }}
                 name="tname" id="tname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="sname">Second Name</label>
              <input
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, secondName: e.target.value
                }))
              }} name="sname" id="sname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="code">App Name</label>
              <input
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, appName: e.target.value
                }))
              }} id="code" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="team">Team</label>
                <select onChange={(e) => {
                      console.log(e.target.value)
                      setData((prev) => ({
                        ...prev, playerTeam: e.target.value
                      }))
                    }} className="form-control" name="team" id="team">
                  {teams?.map(team => 
                    <option 
                    key={team._id} 
                    value={team._id}
                    >{team.name}</option>
                  )}
                </select>
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="team">Position</label>
                <select
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev, playerPosition: e.target.value
                  }))
                }}
                className="form-control" name="position" id="position">
                  {positions?.map(position => 
                    <option 
                    key={position._id} 
                    value={position._id}
                    >{position.singularName}</option>
                  )}
                </select>
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="price">Price</label>
              <input
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, startCost: +e.target.value
                }))
              }} id="price" className="form-control" type="number" />
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