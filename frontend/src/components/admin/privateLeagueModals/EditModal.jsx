import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useEditLeagueMutation, useGetLeagueQuery } from "../../../slices/leagueApiSlice" 
const EditModal = (props) => {
  const {show, closeEdit, resetEdit, privateLeagueId} = props
  const [data, setData] = useState({
    name: ""
  })

  const { name } = data
  
  const { data: privateLeague } = useGetLeagueQuery(privateLeagueId)
  const [ editTeamLeague ] = useEditLeagueMutation()

  useEffect(() => {
    setData({name:privateLeague?.name})
  }, [privateLeague?.name])
  const onSubmit = async (e) => {
    e.preventDefault()
    const { elements } = e.currentTarget
    const name = elements.name.value

    if(name) {
      await editTeamLeague({id: privateLeague?._id, name})
      closeEdit()
      resetEdit()
    }

    if(!privateLeague) {
      return (
        <section>
          <h4>Private League not found!</h4>
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
              <input
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
                name="name"
                id="name"
                className="form-control"
                value={name}
              />
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