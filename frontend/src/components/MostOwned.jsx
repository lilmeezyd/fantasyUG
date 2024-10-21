import { useGetPlayersQuery } from "../slices/playerApiSlice"
import { Spinner } from "react-bootstrap"
import PlayerDetails from "./PlayerDetails"
import { 
  getPlayers
} from "../helpers/playersHelper";

const MostOwned = () => {
  const { data, isLoading } = useGetPlayersQuery()
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
    <>
    <div className="home-section-sub">
      <h6 className="home-stars">Most owned players</h6>
    {allPlayers.map(player => 
      <div className="home-section-details" key={player._id}>
        <PlayerDetails playerId={player._id}></PlayerDetails>
        <div>{player.ownership}%</div>
      </div>
    )}
    </div>
    </>
  )
}

export default MostOwned