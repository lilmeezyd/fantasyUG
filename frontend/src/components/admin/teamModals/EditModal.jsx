import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"

const EditModal = (props) => {
  const {show, closeEdit, editTeamNow, teamName} = props
  const [ data, setData ] = useState({name: '', shortName: '', code: ''})
  const { name, shortName, code} = data

  useEffect(() => {
    setData({name:teamName.name, shortName: teamName.shortName, code: teamName.code})
  }, [teamName.name, teamName.shortName, teamName.code])
  const onSubmit = (e) => {
    e.preventDefault()
    editTeamNow(data)
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
                  setData((prev) => ({
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
                setData((prev) => ({
                  ...prev, shortName: e.target.value
                }))
              }} value={shortName} name="sname" id="sname" className="form-control" type="text" />
              </div>
              <div className="form-group my-2">
              <label className="py-2" htmlFor="code">Team Code</label>
              <input
              onChange={(e) => {
                setData((prev) => ({
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