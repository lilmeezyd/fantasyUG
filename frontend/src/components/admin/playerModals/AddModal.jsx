import { Modal, Button } from "react-bootstrap"
import { useState  } from "react"
import {  useGetQuery } from "../../../slices/teamApiSlice"
import { useGetPositionsQuery } from "../../../slices/positionApiSlice"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props
    const [ data, setData ] = useState({firstName: '', secondName: '', appName: '',
      playerPosition: '', playerTeam: '', startCost: ''
    })
    //const [ teams, setTeams ] = useState([])

    const { data: teams} = useGetQuery()
    const { data: positions } = useGetPositionsQuery()

    const confirmAdd = (e) => {
      e.preventDefault()
      submit(data) 

    }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Add Player</h6>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="tname">
            Player Name
          </label>
          <input
            onChange={(e) => {
                  setData((prev) => ({
                    ...prev, firstName: e.target.value
                  }))
                }}
            name="tname"
            id="tname"
            className="w-full px-3 py-1 border rounded"
            type="text"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="sname">
            Second Name
          </label>
          <input
            onChange={(e) => {
                setData((prev) => ({
                  ...prev, secondName: e.target.value
                }))
              }}
            name="sname"
            id="sname"
            className="w-full px-3 py-1 border rounded"
            type="text"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="appName">
            App Name
          </label>
          <input
            onChange={(e) => {
                setData((prev) => ({
                  ...prev, appName: e.target.value
                }))
              }}
            id="appName"
            className="w-full px-3 py-1 border rounded"
            type="text"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="team">
            Team
          </label>
          <select onChange={(e) => {
                      setData((prev) => ({
                        ...prev, playerTeam: e.target.value
                      }))
                    }} className="w-full px-3 py-1 border rounded" name="team" id="team">
                      <option value="">---Select---</option>
                  {teams?.map(team => 
                    <option 
                    key={team._id} 
                    value={team._id}
                    >{team.name}</option>
                  )}
                </select>
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="position">
            Position
          </label>
          <select onChange={(e) => {
                      setData((prev) => ({
                        ...prev, playerPosition: e.target.value
                      }))
                    }} className="w-full px-3 py-1 border rounded" name="position" id="position">
                      <option value="">---Select---</option>
                  {positions?.map(position => 
                    <option 
                    key={position._id} 
                    value={position._id}
                    >{position.singularName}</option>
                  )}
                </select>
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="price">
            Price
          </label>
          <input
             onChange={(e) => {
                setData((prev) => ({
                  ...prev, startCost: +e.target.value
                }))
              }}
            id="price"
            className="w-full px-3 py-1 border rounded"
            type="number"
          />
        </div>
        <div className="py-2 flex justify-between space-x-3">
          <button onClick={closeAdd} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={confirmAdd}
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