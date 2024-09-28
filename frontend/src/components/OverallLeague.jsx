import { useParams } from "react-router-dom"
import { useGetOverallLeagueQuery } from "../slices/leagueApiSlice"

const OverallLeague = () => {
  const { id } = useParams()
  console.log(id)
  const { data, isLoading } = useGetOverallLeagueQuery(id)
  console.log(data)
  return (
    <div>OverallLeague</div>
  )
}

export default OverallLeague