import { useGetPlayersQuery } from "../slices/playerApiSlice"
import {useGetPositionsQuery} from "../slices/positionApiSlice"
import {useGetQuery} from "../slices/teamApiSlice"
import { Spinner } from "react-bootstrap"
import { 
  getPlayers
} from "../helpers/playersHelper";

const MostOwned = () => {
  const { data, isLoading } = useGetPlayersQuery()
  const { data: teams } = useGetQuery()
  const { data: positions } = useGetPositionsQuery()
  const params = 
  {sort:'ownership', view: 'allPlayers', word:'', sortWord: 'Points', cutPrice: 25}
  const { sort, view, word, cutPrice} = params
  const allPlayers = getPlayers(
    data,
    sort,
    view,
    word,
    cutPrice
  ).returnedPlayers.slice(0,10);
if(isLoading) {
  return (
    <div className="spinner">
      <Spinner />
    </div>
  )
}
  return (
    <div>
      <h5>Most owned players</h5>
    {allPlayers.map(player => 
      <div key={player._id}>
        <div>{player.appName}</div>
        <div>{positions?.find(x => x._id === player.playerPosition)?.shortName}</div>
        <div>{teams?.find(x => x._id === player.playerTeam)?.shortName}</div>
        <div>{player.ownership}%</div>
      </div>
    )}
    </div>
  )
}

export default MostOwned