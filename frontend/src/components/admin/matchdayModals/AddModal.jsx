import { Modal, Button } from "react-bootstrap"
import { useState } from "react"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props
    const [ data, setData ] = useState({nameId: '', deadline:'', time:''})
    const { deadline, time, nameId} = data
    const onSubmit = (e) => {
      const matchdayName = `Matchday ${nameId}`
      e.preventDefault() 
     const deadlineTime = deadline+'/'+time
      submit({name: matchdayName, deadlineTime}) 
 
    }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Add Matchday</h6>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="matchday">Matchday</label>
          <input
            onChange={(e) => {
                  setData((prev) => ({
                    ...prev, nameId: e.target.value
                  }))
                }}
            name="matchday" id="matchday"
            className="w-full px-3 py-1 border rounded"
            type="number"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="deadline">Date</label>
          <input name="deadline" id="deadline" type="date"
            onChange={(e) => {
                setData((prev) => ({
                  ...prev, deadline: e.target.value
                }))
              }}
            className="w-full px-3 py-1 border rounded"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="time">Time</label>
          <input
            onChange={(e) => {
                setData((prev) => ({
                  ...prev, time: e.target.value
                }))
              }} name="time" id="time"
            className="w-full px-3 py-1 border rounded"
            type="time"
          />
        </div>
        <div className="py-2 flex justify-between space-x-3">
          <button onClick={closeAdd} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddModal