import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useGetTeamLeagueQuery, useEditTeamLeagueMutation } from "../../../slices/leagueApiSlice" 
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice"
import { useGetQuery } from "../../../slices/teamApiSlice"
const EditModal = (props) => {
  const {show, closeEdit, resetEdit, teamLeagueId} = props
  const [data, setData] = useState({
    team: "",
    startMatchday: "",
    endMatchday: "",
  })
  
  const { data: teamLeague } = useGetTeamLeagueQuery(teamLeagueId)
  const { data: matchdays } = useGetMatchdaysQuery()
  const { data: teams } = useGetQuery()
  const [ editTeamLeague ] = useEditTeamLeagueMutation()

  useEffect(() => {
    setData({team:teamLeague?.team, startMatchday: teamLeague?.startMatchday, code: teamLeague?.endMatchday})
  }, [teamLeague?.team, teamLeague?.startMatchday, teamLeague?.endMatchday])
  const onSubmit = async (e) => {
    e.preventDefault()
    const { elements } = e.currentTarget
    const team = elements.name.value
    const startMatchday = elements.start.value
    const endMatchday = elements.end.value

    if(team && startMatchday && endMatchday) {
      await editTeamLeague({id: teamLeague?._id, team, startMatchday, endMatchday})
      closeEdit()
      resetEdit()
    }

    if(!teamLeague) {
      return (
        <section>
          <h4>Team League not found!</h4>
        </section>
      )
    }
    
  }
return (
  <Modal show={show} onHide={closeEdit}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
          <Modal.Title>
            <div className="info-details">Edit Team League</div></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <form onSubmit={onSubmit} action="">
            <div className="form-group my-2">
              <label className="py-2" htmlFor="name">
                League
              </label>
              <select
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    team: e.target.value,
                  }));
                }}
                name="name"
                id="name"
                className="form-control"
              >
                {teams?.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="start">
                Start Matchday
              </label>
              <select
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    startMatchday: e.target.value,
                  }));
                }}
                name="start"
                id="start"
                className="form-control"
              >
                {matchdays?.map((matchday) => (
                  <option key={matchday._id} value={matchday._id}>
                    {matchday.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="end">
                End matchday
              </label>
              <select
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    endMatchday: e.target.value,
                  }));
                }}
                id="end"
                name="end"
                className="form-control"
              >
                {matchdays?.map((matchday) => (
                  <option key={matchday._id} value={matchday._id}>
                    {matchday.name}
                  </option>
                ))}
              </select>
            </div>
            <div className=" py-2 my-2">
              <Button type="submit" className="btn-success form-control">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
  </Modal>
)
}

export default EditModal