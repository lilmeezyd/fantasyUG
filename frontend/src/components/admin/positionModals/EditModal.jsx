import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useGetPositionQuery, useEditPositionMutation } from "../../../slices/positionApiSlice"
import { toast } from "react-toastify";

const EditModal = (props) => {
  const {show, closeEdit, resetEdit, positionId} = props
  const { data: position, refetch } = useGetPositionQuery(positionId)
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
      try {
        const res = await editPosition({id: position._id, singularName, shortName, code}).unwrap()
        toast.success(res?.msg);
      closeEdit()
      resetEdit()
      } catch (error) {
        toast.error("Update failed!");
        closeEdit()
      resetEdit()
      }
      
    }
    refetch();
  }
return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Edit Position</h6>
        <form onSubmit={onSubmit} action="">
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="tname">
              Position Name
            </label>
            <input
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
              }}
              value={name}
              name="tname"
              id="tname"
              className="w-full px-3 py-1 border rounded"
              type="text"
            />
          </div>
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="sname">
              Short Name
            </label>
            <input
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  shortName: e.target.value,
                }));
              }}
              value={shortName}
              name="sname"
              id="sname"
              className="w-full px-3 py-1 border rounded"
              type="text"
            />
          </div>
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="code">
              Position Code
            </label>
            <input
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  code: +e.target.value,
                }));
              }}
              value={code}
              id="code"
              className="w-full px-3 py-1 border rounded"
              type="number"
            />
          </div>
          <div className="py-2 flex justify-between space-x-3">
            <button onClick={closeEdit} className="px-3 py-1 border rounded">
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
)
}

export default EditModal