import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice"
import { useGetQuery } from "../slices/teamApiSlice"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"

const Leagues = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { data } = useGetManagerInfoQuery(userInfo?._id)
  const { data: teams } = useGetQuery()
  console.log(data)
  return (
    <div className="py-2">
      <div className="p-2">
      <p className="text-3xl text-center font-semibold">Leagues</p>
      <div className="bg-gray-200 h-0.5 w-[60%] m-auto"></div>
      <div className="min-w-[320px] overflow-auto">
        <table className="m-auto text-xl">
        <thead className="border-bottom border-gray-200 ">
          <tr>
            <th className="px-4 py-3 text-center text-truncate">League</th>
            <th className="px-4 py-3 text-center text-truncate">Previous</th>
            <th className="px-4 py-3 text-center text-truncate">Current</th>
            <th className="px-4 py-3 text-center text-truncate">Points</th>
            <th className="px-4 py-3 text-center text-truncate">Actions</th>
          </tr>
        </thead>
        <tbody className="font-medium">
          {data?.overallLeagues?.map(x => <tr className="border-bottom border-gray-200 " key={x.id}>
            <td className="px-4 py-3 text-center text-truncate"><Link to={`/leagues/${x.id}/standings`}>{x.name}</Link></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.lastRank ?? '-'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.currentRank ?? '-'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.overallPoints ?? '0'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">None</div></td>
          </tr>)}
          {data?.teamLeagues?.map(x => <tr className="border-bottom border-gray-200 " key={x.id}>
            <td className="px-4 py-3 text-center text-truncate"><Link to={`/leagues/${x.id}/standings`}>{x.name}</Link></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.lastRank ?? '-'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.currentRank ?? '-'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.overallPoints ?? '0'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">None</div></td>
          </tr>)}
          {data?.privateLeagues?.map(x => <tr key={x.id}>
            <td className="px-4 py-3 text-center text-truncate"><Link to={`/leagues/${x.id}/standings`}>{x.name}</Link></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.lastRank ?? '-'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.currentRank ?? '-'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">{x.overallPoints ?? '0'}</div></td>
            <td className="px-4 py-3 text-center text-truncate"><div className="">None</div></td>
          </tr>)}
        </tbody>
      </table>
      </div>
        </div>
    </div>
  )
}

export default Leagues