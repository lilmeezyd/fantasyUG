import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import {  useGetMutation } from "../../../slices/teamApiSlice"
import { useGetPositionsMutation } from "../../../slices/positionApiSlice"

const EditModal = (props) => {
  const {show, closeEdit, editPlayerNow, playerName} = props
  const [ data, setData ] = useState({firstName: '', secondName: '', appName: '',
    playerPosition: '', playerTeam: '', startCost: ''
  })
  const { firstName, secondName, appName, playerPosition, playerTeam, startCost} = data
  const [ teams, setTeams ] = useState([])
  const [ positions, setPositions ] = useState([])

  const [ get] = useGetMutation()
  const [ getPositions ] = useGetPositionsMutation()

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await get().unwrap()
        setTeams(res)
      } catch (error) {
        console.log(error)
      }
  }
  const fetchPositions = async () => {
    try {
      const res = await getPositions().unwrap()
      setPositions(res)
    } catch (error) {
      console.log(error)
    }
}
fetchTeams()
  fetchPositions()
  }, [get, getPositions])

  useEffect(() => {
    setData({firstName:playerName.firstName,
      secondName: playerName.secondName, appName: playerName.appName,
      playerPosition: playerName.playerPosition, playerTeam: playerName.playerTeam,
    startCost: playerName.startCost})
  }, [playerName.firstName, playerName.secondName, playerName.appName,
    playerName.playerPosition, playerName.playerTeam, playerName.startCost
  ])
  const onSubmit = (e) => {
    e.preventDefault()
    editPlayerNow(data)
  }
return (
  <Modal show={show} onHide={closeEdit}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
          <Modal.Title>
            <div className="info-details">Edit Player</div></Modal.Title>
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
                value={firstName}
                 name="tname" id="tname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="sname">Second Name</label>
              <input
              value={secondName}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, secondName: e.target.value
                }))
              }} name="sname" id="sname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="code">App Name</label>
              <input
              value={appName}
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
                  {teams.map(team => 
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
                  {positions.map(position => 
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
              value={startCost}
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

export default EditModal