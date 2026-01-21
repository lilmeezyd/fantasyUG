import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useGetOverallLeagueQuery, useEditOverallLeagueMutation } from "../../../slices/leagueApiSlice" 
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice"
import { toast } from "react-toastify"
const EditModal = (props) => {
  const {show, closeEdit, resetEdit, overallLeagueId} = props 
  const [data, setData] = useState({
    name: "",
    startMatchday: "",
    endMatchday: "", 
  })
 
  const { name, startMatchday, endMatchday } = data
  
  const { data: overallLeague, refetch } = useGetOverallLeagueQuery(overallLeagueId)
  const { data: matchdays } = useGetMatchdaysQuery()
  const [ editOverallLeague ] = useEditOverallLeagueMutation()

  useEffect(() => {
    setData({name:overallLeague?.name, startMatchday: overallLeague?.startGW, endMatchday: overallLeague?.endMatchday})
  }, [overallLeague?.name, overallLeague?.startMatchday, overallLeague?.endMatchday])
  const onSubmit = async (e) => {
    e.preventDefault()
    const { elements } = e.currentTarget
    const name = elements.name.value
    const startMatchday = elements.start.value
    const endMatchday = elements.end.value

    if(name && startMatchday && endMatchday) {
      try {
        const res = await editOverallLeague({id: overallLeague?._id, name, startMatchday, endMatchday})
        toast.success("Update Complete")
      closeEdit()
      resetEdit()
      } catch (error) {
        toast.success("Update Failed")
      closeEdit()
      resetEdit()
      }
    }

    refetch();

    if(!overallLeague) {
      return (
        <section>
          <h4>Overall League not found!</h4>
        </section>
      )
    }
    
  }
return (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h3 className="text-lg font-bold">Edit Overall League</h3>
        <form onSubmit={onSubmit}>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="name">Team League</label>
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
            className="w-full px-3 py-1 border rounded"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="start">Start Matchday</label>
          <select
          value={startMatchday}
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
              value={endMatchday}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev, endMatchday: e.target.value
                }))
              }} id="end" name="end"
            className="w-full px-3 py-1 border rounded"
          >
            <option value="">---Select---</option>
            {matchdays?.map(matchday => <option key={matchday._id} value={matchday._id}>
                  {matchday.name}
                </option>)}
          </select>
        </div>
        <div className="py-2 flex justify-between space-x-3">
          <button onClick={closeEdit} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
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