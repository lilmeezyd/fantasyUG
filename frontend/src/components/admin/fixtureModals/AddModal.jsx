import { Modal, Button } from "react-bootstrap"
import { useState } from "react"
import { useGetQuery } from "../../../slices/teamApiSlice"
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice"
const AddModal = (props) => {
    const {show, closeAdd, submit} = props
    //const [ teams, setTeams ] = useState([])
    const [ data, setData ] = useState({teamHome: '', teamAway: '',
      matchday: '', kickOff: '', time: ''})
      const { teamHome, teamAway,matchday, kickOff, time } = data
      const { data: teams} = useGetQuery()
      const { data:matchdays } = useGetMatchdaysQuery()
      
    const onSubmit = (e) => {
      e.preventDefault()
      const kickOffTime = kickOff+'/'+time
      submit({teamHome, teamAway,matchday, kickOffTime}) 

    }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Add Fixture</h6>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="matchday">Matchday</label>
          <select
            onChange={(e) => {
                  setData(prev => ({
                    ...prev, matchday: e.target.value
                  }))
                }}
            name="matchday" id="matchday"
            className="w-full px-3 py-1 border rounded"
            type="text"
          >
            <option value="">---Select Matchday---</option>
            {matchdays?.map(matchday => 
                    <option key={matchday._id} value={matchday._id}>
                      {matchday.name}
                    </option>
                  )}
          </select>
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="kickoff">Date</label>
          <input name="kickoff" id="kickoff" type="date"
            onChange={(e) => {
                  setData(prev => ({
                    ...prev, kickOff: e.target.value
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
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="hteam">Home Team</label>
          <select onChange={(e) => {
                  setData(prev => ({
                    ...prev, teamHome: e.target.value
                  }))
                }} className="w-full px-3 py-1 border rounded" name="hteam" id="hteam">
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
          <label className="block text-sm font-medium" htmlFor="ateam">Away Team</label>
          <select onChange={(e) => {
                  setData(prev => ({
                    ...prev, teamAway: e.target.value
                  }))
                }} className="w-full px-3 py-1 border rounded" name="ateam" id="ateam">
                      <option value="">---Select---</option>
                  {teams?.map(team => 
                    <option 
                    key={team._id} 
                    value={team._id}
                    >{team.name}</option>
                  )}
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