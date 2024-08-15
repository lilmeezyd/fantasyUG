import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useGetTeamQuery, useEditMutation } from "../../../slices/teamApiSlice"

const EditModal = (props) => {
  const {show, closeEdit, resetEdit, teamId} = props
  const { data: team } = useGetTeamQuery(teamId)
  const [ data1, setData1 ] = useState({name: '', shortName: '',
     code: ''}) 
  const { name, shortName, code} = data1
  const [ edit ] = useEditMutation()

  useEffect(() => {
    setData1({name:team?.name, shortName: team?.shortName, code: team?.code})
  }, [team?.name, team?.shortName, team?.code])
  const onSubmit = async (e) => {
    e.preventDefault()
    const {elements}  = e.currentTarget
    const name = elements.tname.value
    const shortName = elements.sname.value
    const code = +elements.code.value

    if(name && shortName && code) {
      await edit({id: team._id, name, shortName, code})
      closeEdit()
      resetEdit()
    }
  }
  if(!team) {
    return (
      <section>
        <h4>Team not found!</h4>
      </section>
    )
  }
return (
  <Modal show={show} onHide={closeEdit}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
          <Modal.Title>
            <div className="info-details">Edit Team</div></Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div>
            <form onSubmit={onSubmit} action="">
              <div className="form-group my-2">
                <label className="py-2" htmlFor="tname">Team Name</label>
                <input
                onChange={(e) => {
                  setData1((prev) => ({
                    ...prev, name: e.target.value
                  }))
                }}
                value={name}
                 name="tname" id="tname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="sname">Short Name</label>
              <input
              onChange={(e) => {
                setData1((prev) => ({
                  ...prev, shortName: e.target.value
                }))
              }} value={shortName} name="sname" id="sname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="code">Team Code</label>
              <input
              onChange={(e) => {
                setData1((prev) => ({
                  ...prev, code: +e.target.value
                }))
              }} value={code} id="code" className="form-control" type="number" />
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