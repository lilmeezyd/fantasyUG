import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useGetOverallLeagueQuery, useEditOverallLeagueMutation } from "../../../slices/leagueApiSlice" 
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice"
const EditModal = (props) => {
  const {show, closeEdit, resetEdit, overallLeagueId} = props 
  const [data, setData] = useState({
    name: "",
    startMatchday: "",
    endMatchday: "",
  })

  const { name, startMatchday, endMatchday } = data
  
  const { data: overallLeague } = useGetOverallLeagueQuery(overallLeagueId)
  const { data: matchdays } = useGetMatchdaysQuery()
  const [ editOverallLeague ] = useEditOverallLeagueMutation()

  useEffect(() => {
    setData({name:overallLeague?.name, startMatchday: overallLeague?.startMatchday, endMatchday: overallLeague?.endMatchday})
  }, [overallLeague?.name, overallLeague?.startMatchday, overallLeague?.endMatchday])
  const onSubmit = async (e) => {
    e.preventDefault()
    const { elements } = e.currentTarget
    const name = elements.name.value
    const startMatchday = elements.start.value
    const endMatchday = elements.end.value

    if(name && startMatchday && endMatchday) {
      await editOverallLeague({id: overallLeague?._id, name, startMatchday, endMatchday})
      closeEdit()
      resetEdit()
    }

    if(!overallLeague) {
      return (
        <section>
          <h4>Overall League not found!</h4>
        </section>
      )
    }
    
  }
return (
  <Modal show={show} onHide={closeEdit}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
          <Modal.Title>
            <div className="info-details">Edit Overall League</div></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <form onSubmit={onSubmit} action="">
            <div className="form-group my-2">
              <label className="py-2" htmlFor="name">
                League
              </label>
              <input
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
                value={name}
                name="name"
                id="name"
                className="form-control"
              />
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