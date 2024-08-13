import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useGetMutation } from "../../../slices/teamApiSlice"
import { useGetMatchdaysMutation } from "../../../slices/matchdayApiSlice"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props
    const [ teams, setTeams ] = useState([])
    const [ matchdays, setMatchdays ] = useState([])
    const [ data, setData ] = useState({teamHome: '', teamAway: '',
      matchday: '', kickOffTime: ''})
      const [ get ] = useGetMutation()
      const [ getMatchdays ] = useGetMatchdaysMutation()

      useEffect(() => {
        const getTeams = async () => {
          try {
            const res = await get().unwrap()
            setTeams(res)
          } catch (error) {
            console.log(error)
          }
        }
        const getMds = async () => {
          try {
            const res = await getMatchdays().unwrap()
            setMatchdays(res)
          } catch (error) {
            console.log(error)
          }
        }

        getTeams()
        getMds()
      }, [get, getMatchdays])
    const onSubmit = (e) => {
      e.preventDefault()
      submit(data)

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
                  {matchdays.map(matchday => 
                    <option key={matchday._id} value={matchday._id}>
                      {matchday.name}
                    </option>
                  )}
                </select>
              </div>
              <div className="form-group my-2">
                <label className="py-2" htmlFor="hteam">Kickoff time</label>
                <input name="kickoff" id="kickoff" type="date"
                className="form-control"
                onChange={(e) => {
                  setData(prev => ({
                    ...prev, kickOffTime: e.target.value
                  }))
                }}
                />
                  
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
                  {teams.map(team => 
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
                  {teams.map(team => 
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