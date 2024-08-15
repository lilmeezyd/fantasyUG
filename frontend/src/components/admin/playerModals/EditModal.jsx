import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import {  useGetQuery } from "../../../slices/teamApiSlice"
import { useGetPositionsQuery } from "../../../slices/positionApiSlice" 
import { useGetPlayerQuery, useEditPlayerMutation } from "../../../slices/playerApiSlice"

const EditModal = (props) => { 
  const {show, closeEdit, resetEdit, playerId} = props
  const { data: player } = useGetPlayerQuery(playerId)
  const [ data, setData ] = useState({firstName: '', secondName: '', appName: '',
    playerPosition: '', playerTeam: '', startCost: ''
  })
  const { firstName, secondName, appName, playerPosition, playerTeam, startCost} = data

  const { data: teams} = useGetQuery()
  const { data: positions } = useGetPositionsQuery()
  const [ editPlayer ] = useEditPlayerMutation()

  useEffect(() => {
    setData({firstName:player?.firstName,
      secondName: player?.secondName, appName: player?.appName,
      playerPosition: player?.playerPosition, playerTeam: player?.playerTeam,
    startCost: player?.startCost})
  }, [player?.firstName, player?.secondName, player?.appName,
    player?.playerPosition, player?.playerTeam, player?.startCost
  ])
  const onSubmit = async (e) => {
    e.preventDefault()
    const {elements}  = e.currentTarget
    const firstName = elements.tname.value
    const secondName = elements.sname.value
    const appName = elements.code.value
    const team = elements.team.value
    const position = elements.position.value
    const price = elements.price.value

    if(firstName && secondName && appName && team && position && price) {
      await editPlayer({id: player?._id, firstName, secondName, appName, team, position, price})
      closeEdit()
      resetEdit()
    }
  }
  if(!player) {
    return (
      <section>
        <h4>Player not found!</h4>
      </section>
    )
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
                  {teams?.map(team => 
                    <option 
                    key={team._id} 
                    value={team._id}
                    >{team.name}</option>
                  )}
                </select>
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="position">Position</label>
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
              value={startCost}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, startCost: +e.target.value
                }))
              }} id="price" name="price" className="form-control" type="number" />
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