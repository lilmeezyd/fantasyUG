import { useParams, Link } from "react-router-dom"
import { useGetTeamLeagueQuery } from "../slices/leagueApiSlice"
import { useGetMaxIdQuery } from "../slices/matchdayApiSlice"
import { Spinner } from "react-bootstrap"
import { useSelector } from "react-redux"
import { AiFillCaretRight, AiFillCaretDown, AiFillCaretUp } from "react-icons/ai";
const TeamLeague = () => {
  const { id } = useParams()
  const { data, isLoading } = useGetTeamLeagueQuery(id)
  const { data: maxId } = useGetMaxIdQuery()
  const { userInfo } = useSelector(state => state.auth)
  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    )
  }
  return (
    <>
      <div>
        {data?.standings?.length > 0 &&
          <>
            <div className="standing-header">Leaderboard</div>
            <div className="standing-grid-1 standing-grid-header">
              <div></div>
              <div>Rank</div>
              <div className="standing-grid-name">Team Name</div>
              <div>MD Points</div>
              <div>Total</div>
            </div>
            {data?.standings?.map((entrant, idx) =>

              <div
                style={{
                  background: `${userInfo._id === entrant.user.toString() ? '#ffd70063' : 'white'}`,
                  border: `${userInfo._id === entrant.user.toString() ? '2px solid gold' : '2px solid transparent'}`
                }} key={entrant._id} className="standing-grid-1">
                <div>
                  {(entrant?.currentRank === entrant?.lastRank || entrant?.lastRank === null) && <AiFillCaretRight color="#aaa" />}
                  {entrant?.currentRank < entrant?.lastRank && entrant?.lastRank !== null && <AiFillCaretUp color="green" />}
                  {entrant?.currentRank > entrant?.lastRank && entrant?.lastRank !== null && <AiFillCaretDown color="red" />}
                </div>
                <div>{entrant?.currentRank}</div>
                <div className="standing-grid-name">
                  <Link to={`/points/${entrant.user.toString()}`}>
                    <div>
                      <div>{entrant?.teamName}</div>
                      <div>
                        {entrant?.firstName}&nbsp;&nbsp;{entrant?.lastName}
                      </div>
                    </div></Link></div>

                <div>{entrant?.matchdays[maxId]}</div>
                <div>{entrant?.overallPoints}</div>
              </div>
            )}
          </>
        }
      </div>

      <div>
        {data?.entrants?.length > 0 &&
          <>
            <div className="standing-header">{data?.entrants?.length}&nbsp;
              {data?.entrants?.length > 1 ? 'managers' : 'manager'}  to be added on next update</div>
            <div className="standing-grid standing-grid-header">
              <div className="standing-grid-name">Team Name</div>
              <div className="standing-grid-name">Manager</div>
            </div>
            {data?.entrants?.map(entrant =>
              <div key={entrant._id}>
                <div className="standing-grid">
                  <div className="standing-grid-name">{entrant?.teamName}</div>
                  <div className="standing-grid-name">
                    {entrant?.firstName}&nbsp;&nbsp;{entrant?.lastName}
                  </div>
                </div>
              </div>
            )}
          </>
        }
      </div>
    </>
  )
}

export default TeamLeague