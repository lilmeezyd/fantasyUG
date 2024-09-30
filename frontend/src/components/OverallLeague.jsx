import { useParams } from "react-router-dom"
import { useGetOverallLeagueQuery } from "../slices/leagueApiSlice"
import {Spinner} from "react-bootstrap"
const OverallLeague = () => {
  const { id } = useParams()
  const { data, isLoading } = useGetOverallLeagueQuery(id)
  if(isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    )
  }
  return (
    <div>
      {data?.entrants?.length > 0 && 
      <>
      <div className="standing-header">{`${data?.entrants?.length} managers to be added on next update`}</div>
      <div className="standing-grid standing-grid-header">
          <div>Team Name</div>
            <div>Manager</div>
          </div>
      {data?.entrants?.map(entrant => 
        <div key={entrant._id}>
          <div className="standing-grid">
          <div>{entrant?.teamName}</div>
          <div className="standing-grid-manager">
            <div>{entrant?.firstName}</div>
            <div>{entrant?.lastName}</div>
          </div>
          </div>
        </div>
      )}
      </>
      }
    </div>
  )
}

export default OverallLeague