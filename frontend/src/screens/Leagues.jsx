import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice"
import { useGetQuery } from "../slices/teamApiSlice"
import { Link } from "react-router-dom"

const Leagues = () => {
  const { data } = useGetManagerInfoQuery()
  const { data: teams } = useGetQuery()
  return (
    <div className="league-bg">
      <div className="standing-wrap">
      <h5 className="standing-header">Leagues</h5>
      <div className="standing-grid-2 standing-grid-header">
        <div className="standing-grid-name">League</div>
        <div className="standing-grid-name">Previous rank</div>
        <div className="standing-grid-name">Current rank</div>
        <div className="standing-grid-name">Points</div>
        <div className="standing-grid-name">Actions</div>
      </div>
        {data?.overallLeagues?.map(x => 
          <div className="standing-grid-2" key={x.id}>
            <div className="standing-grid-name">
            <Link to={`/userleagues/overall/${x.id}`}>{x.name}</Link></div>
            <div className="standing-grid-name">{x.lastRank}</div>
            <div className="standing-grid-name">{x.currentRank}</div>
            <div className="standing-grid-name">{x.overallPoints}</div>
            <div className="standing-grid-name">None</div>
          </div>
        )}
      {data?.teamLeagues?.map(x => 
          <div className="standing-grid-2" key={x.id}>
            <div className="standing-grid-name">
            <Link to={`/userleagues/team/${x.id}`}>{teams?.find(team => team._id === x.team)?.name}
            </Link></div>
            <div className="standing-grid-name">{x.lastRank}</div>
            <div className="standing-grid-name">{x.currentRank}</div>
            <div className="standing-grid-name">{x.overallPoints}</div>
            <div className="standing-grid-name">None</div>
          </div>
        )}
      {data?.privateLeagues?.map(x => 
          <div className="standing-grid-2" key={x.id}>
            <div className="standing-grid-name">
            <Link to={`/userleagues/private/${x.id}`}>{x.name}</Link></div>
            <div className="standing-grid-name">{x.lastRank}</div>
            <div className="standing-grid-name">{x.currentRank}</div>
            <div className="standing-grid-name">{x.overallPoints}</div>
            <div className="standing-grid-name"></div>
          </div>
        )}
        </div>
    </div>
  )
}

export default Leagues