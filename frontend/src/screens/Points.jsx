import { useSelector } from 'react-redux'
import { useGetLivePicksQuery } from '../slices/livePicksApiSlice'

const Points = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { data: live } = useGetLivePicksQuery(userInfo?._id)
  console.log(live)
  return (
    live?.length > 0 ? 
      <div>Points appear</div> : 
      <div className='tx-center'>Live scores will appear here when matchday starts!</div>
    
  )
}

export default Points