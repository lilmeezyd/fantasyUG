import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useGetPositionQuery, useEditPositionMutation } from "../../../slices/positionApiSlice"

const EditModal = (props) => {
  const {show, closeEdit, resetEdit, positionId} = props
  const { data: position } = useGetPositionQuery(positionId)
  const [ data, setData ] = useState({singularName: '', shortName: '', code: ''})
  const { name, shortName, code} = data
  const [ editPosition ] = useEditPositionMutation()

  useEffect(() => {
    setData({name:position?.singularName, shortName: position?.shortName, code: position?.code})
  }, [position?.singularName, position?.shortName, position?.code])

  const onSubmit = async (e) => {
    e.preventDefault()
    const {elements}  = e.currentTarget
    const singularName = elements.tname.value
    const shortName = elements.sname.value
    const code = +elements.code.value

    if(name && shortName && code) {
      await editPosition({id: position._id, singularName, shortName, code})
      closeEdit()
      resetEdit()
    }
  }
return (
  <Modal show={show} onHide={closeEdit}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
          <Modal.Title>
            <div className="info-details">Edit Position</div></Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <div>
            <form onSubmit={onSubmit} action="">
              <div className="form-group my-2">
                <label className="py-2" htmlFor="tname">Position Name</label>
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
              <label className="py-2" htmlFor="code">Position Code</label>
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