import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice"
import MDStar from "./MDStar"
import { Spinner } from "react-bootstrap"

const StarsOfWeek = () => {
  const { data: matchdays, isLoading } = useGetMatchdaysQuery()

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
      {matchdays?.map(matchday => 
        <div key={matchday._id}>
          <MDStar id={matchday?.id}
          _id={matchday?._id}
          topPlayer={matchday?.topPlayer}
          ></MDStar>
        </div>
      )}
      </div>
    </div>
  )
}

export default StarsOfWeek