import { Modal, Button } from "react-bootstrap"
import { useState } from "react"
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props 
    const [ data, setData ] = useState({name: '', startMatchday: '', endMatchday: ''})
    const { data: matchdays } = useGetMatchdaysQuery()
    const onSubmit = (e) => {
      e.preventDefault()
      submit(data) 
 
    }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h3 className="text-lg font-bold">Add Overall League</h3>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="lname">League Name</label>
          <input
            onChange={(e) => {
                  setData((prev) => ({
                    ...prev, name: e.target.value
                  }))
                }}
            name="lname" id="lname"
            className="w-full px-3 py-1 border rounded"
            type="text"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="start">Start Matchday</label>
          <select
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, startMatchday: e.target.value
                }))
              }} name="start" id="start"
            className="w-full px-3 py-1 border rounded"
          >
            <option value="">---Select---</option>
            {matchdays?.map(matchday => <option key={matchday._id} value={matchday._id}>
                  {matchday.name} </option>)}
          </select>
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="end">End matchday</label>
              <select
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, endMatchday: e.target.value
                }))
              }} id="end" name="end"
            className="w-full px-3 py-1 border rounded"
            type="time"
          >
            <option value="">---Select---</option>
            {matchdays?.map(matchday => <option key={matchday._id} value={matchday._id}>
                  {matchday.name}
                </option>)}
          </select>
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
