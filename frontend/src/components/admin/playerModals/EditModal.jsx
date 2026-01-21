import { Modal, Button } from "react-bootstrap"
import { useState, useEffect } from "react"
import {  useGetQuery } from "../../../slices/teamApiSlice"
import { useGetPositionsQuery } from "../../../slices/positionApiSlice" 
import { useGetPlayerQuery, useEditPlayerMutation } from "../../../slices/playerApiSlice"
import { toast } from 'react-toastify';

const EditModal = (props) => { 
  const {show, closeEdit, resetEdit, playerId} = props
  const { data: player = {} , refetch} = useGetPlayerQuery(playerId)
  const [ data, setData ] = useState({firstName: '', secondName: '', appName: '',
    playerPosition: '', playerTeam: '', startCost: ''
  })
  const { firstName, secondName, appName, playerPosition, playerTeam, startCost} = data
 
  const { data: teams} = useGetQuery()
  const { data: positions } = useGetPositionsQuery()
  const [ editPlayer ] = useEditPlayerMutation()

  useEffect(() => {
    setData({firstName:player?.firstName,
      secondName: player?.secondName, appName: player?.appName,
      playerPosition: player?.playerPosition, playerTeam: player?.playerTeam,
    startCost: player?.startCost})
  }, [player?.firstName, player?.secondName, player?.appName,
    player?.playerPosition, player?.playerTeam, player?.startCost
  ])
  const onSubmit = async (e) => {
    e.preventDefault()
    const {elements}  = e.currentTarget
    const firstName = elements.tname.value
    const secondName = elements.sname.value
    const appName = elements.appName.value
    const playerTeam = elements.team.value
    const playerPosition = elements.position.value
    const startCost = elements.price.value

    if(firstName && secondName && appName && playerTeam && playerPosition && startCost) {
     const res = await editPlayer({id: player?._id, firstName, secondName, appName, playerTeam, playerPosition, startCost}).unwrap()
     toast.success(res?.message)
      closeEdit()
      resetEdit()
    }
    refetch()
  }
  if(!player) {
    return (
      <section>
        <h4>Player not found!</h4>
      </section>
    )
  }
return (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Edit Player</h6>
        <form onSubmit={onSubmit}>
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
                value={firstName}
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
              value={secondName}
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
              value={appName}
            id="appName"
            className="w-full px-3 py-1 border rounded"
            type="text"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="team">
            Team
          </label>
          <select value={playerTeam} onChange={(e) => {
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
          <select value={playerPosition} onChange={(e) => {
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
          value={startCost}
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