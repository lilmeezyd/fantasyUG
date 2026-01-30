import { useMemo } from "react"
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice"
import MDStar from "./MDStar"
import { Spinner } from "react-bootstrap"

const StarsOfWeek = (props) => {
  const { players } = props
  const { data: matchdays = [], isLoading } = useGetMatchdaysQuery()
  const formattedData = useMemo(() => {
    const playerMap = new Map(players?.map(x => [x._id, x]))
    return matchdays.map(x => {
      return {
        ...playerMap.get(x.topPlayer),
        id: x.id,
        matchdayId: x._id,
        topPlayer: x.topPlayer
      }
    })
  }, [matchdays, players])

  if(isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    )
  }
  return ( 
    <div className='p-2 my-2 stars home-section-sub'>
      <h6 className="home-stars">MVPs</h6>
      <div className="stars-mds">
      {formattedData?.map(matchday => 
        <div key={matchday.matchdayId}>
          <MDStar id={matchday?.id}
          _id={matchday?.matchdayId}
          topPlayer={matchday?.topPlayer}
          forwardImage={matchday?.forwardImage}
          appName={matchday?.appName}
          ></MDStar>
        </div>
      )}
      </div>
    </div>
  )
}

export default StarsOfWeek