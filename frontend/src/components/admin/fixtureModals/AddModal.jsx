import { Modal, Button } from "react-bootstrap"
import { useState } from "react"
import { useGetQuery } from "../../../slices/teamApiSlice"
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props
    //const [ teams, setTeams ] = useState([])
    const [ data, setData ] = useState({teamHome: '', teamAway: '',
      matchday: '', kickOff: '', time: ''})
      const { teamHome, teamAway,matchday, kickOff, time } = data
      const { data: teams} = useGetQuery()
      const { data:matchdays } = useGetMatchdaysQuery()
 
    const onSubmit = (e) => {
      e.preventDefault()
      const kickOffTime = kickOff+'/'+time
      submit({teamHome, teamAway,matchday, kickOffTime}) 

    }
  return (
    <Modal show={show} onHide={closeAdd}>
        <Modal.Header style={{ background: "aquamarine" }} closeButton>
            <Modal.Title><div className="info-details">Add Fixture</div></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <form onSubmit={onSubmit} action="">
            <div className="form-group my-2">
                <label className="py-2" htmlFor="matchday">Matchday</label>
                <select name="matchday" id="matchday"
                className="form-control"
                onChange={(e) => {
                  setData(prev => ({
                    ...prev, matchday: e.target.value
                  }))
                }}
                >
                  {matchdays?.map(matchday => 
                    <option key={matchday._id} value={matchday._id}>
                      {matchday.name}
                    </option>
                  )}
                </select>
              </div>
              <div className="form-group my-2">
                <label className="py-2" htmlFor="hteam">Date</label>
                <input name="kickoff" id="kickoff" type="date"
                className="form-control"
                onChange={(e) => {
                  setData(prev => ({
                    ...prev, kickOff: e.target.value
                  }))
                }}
                />
                  
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
              <div className="form-group my-2">
                <label className="py-2" htmlFor="hteam">Home Team</label>
                <select name="hteam" id="ateam"
                className="form-control"
                onChange={(e) => {
                  setData(prev => ({
                    ...prev, teamHome: e.target.value
                  }))
                }}
                >
                  {teams?.map(team => 
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  )}
                </select>
              </div>
              <div className="form-group my-2">
                <label className="py-2" htmlFor="hteam">Away Team</label>
                <select name="ateam" id="ateam"
                className="form-control"
                onChange={(e) => {
                  setData(prev => ({
                    ...prev, teamAway: e.target.value
                  }))
                }}
                >
                  {teams?.map(team => 
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  )}
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