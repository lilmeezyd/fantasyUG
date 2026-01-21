import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import { useGetTeamLeagueQuery, useEditTeamLeagueMutation } from "../../../slices/leagueApiSlice"
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice"
import { useGetQuery } from "../../../slices/teamApiSlice"
import { toast } from "react-toastify"
const EditModal = (props) => {
  const { show, closeEdit, resetEdit, teamLeagueId } = props
  const [data, setData] = useState({
    team: "",
    startMatchday: "",
    endMatchday: "",
  })

  const { data: teamLeague = {}, refetch } = useGetTeamLeagueQuery(teamLeagueId)
  const { data: matchdays = [] } = useGetMatchdaysQuery()
  const { data: teams = [] } = useGetQuery()
  const [editTeamLeague] = useEditTeamLeagueMutation()
  const { team, startMatchday, endMatchday } = data
 

  useEffect(() => {
    setData({ team: teamLeague?.team, startMatchday: teamLeague?.startGW, endMatchday: teamLeague?.endMatchday })
  }, [teamLeague?.team, teamLeague?.startMatchday, teamLeague?.endMatchday])
  const onSubmit = async (e) => {
    e.preventDefault()
    const { elements } = e.currentTarget
    const team = elements.name.value
    const startMatchday = elements.start.value
    const endMatchday = elements.end.value

    if (team && startMatchday && endMatchday) {
      try {
        const res = await editTeamLeague({ id: teamLeague?._id, team, startMatchday, endMatchday }).unwrap();
        toast.success("Update complete")
      closeEdit()
      resetEdit()
      } catch (error) {
        toast.error("Update failed")
        closeEdit()
      resetEdit()
      }
      
    }
    refetch()

    if (!teamLeague) {
      return (
        <section>
          <h4>Team League not found!</h4>
        </section>
      )
    }

  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h3 className="text-lg font-bold">Edit Team League</h3>
        <form onSubmit={onSubmit}>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="name">Team League</label>
          <select
          value={team}
              onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    team: e.target.value,
                  }));
                }}
                name="name"
                id="name"
            className="w-full px-3 py-1 border rounded"
          >
            <option value="">---Select---</option>
            {teams?.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
          </select>
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