import LeagueDetails from "../components/LeagueDetails"
import ManagerPicks from "../components/ManagerPicks"
import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice"

const PickTeam = () => {
  const { data: managerInfo } = useGetManagerInfoQuery()
  console.log(managerInfo)
  return (
    <div className='main'>
      <ManagerPicks teamName={managerInfo?.teamName} />
      <LeagueDetails leagues={managerInfo?.leagues} />
    </div>
  )
}

export default PickTeam 