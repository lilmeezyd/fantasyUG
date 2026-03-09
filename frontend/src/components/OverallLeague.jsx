import { useMemo, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  useGetOverallStandingsQuery,
  useGetLeagueQuery,
} from "../slices/leagueApiSlice";
import {
  useGetMaxIdQuery,
  useGetCurrentMDQuery,
} from "../slices/matchdayApiSlice";
import { Spinner } from "react-bootstrap";
import { Button } from "../../@/components/ui/button";
import { useSelector } from "react-redux";
import {
  AiFillCaretRight,
  AiFillCaretDown,
  AiFillCaretUp,
} from "react-icons/ai";
import { useState } from "react";
const OverallLeague = () => {
  const [gw, setGw] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 5;
  const { id, matchday } = useParams();
  const { data = [], isLoading } = useGetOverallStandingsQuery({
    id,
    page,
    limit,
  });
  const { data: maxId } = useGetMaxIdQuery();
  const { data: currentId } = useGetCurrentMDQuery();
  const { data: leagueDetails } = useGetLeagueQuery(id);
  const { userInfo } = useSelector((state) => state.auth);

  const goToPage = (newPage) => {
    setSearchParams({ page: newPage });
  };

  useEffect(() => {
    setGw(currentId);
  }, [currentId]);

  const start = 1;
  const end = 8;
  const options = [];
  for (let i = start; i <= end; i++) {
    options.push(i);
  }

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }
  return (
    <>
      {
        <div>
          {data?.standings?.length > 0 && (
            <div>
              <div className="text-3xl text-center p-2 font-semibold">
                {leagueDetails?.name}&nbsp;&nbsp;Table
              </div>
              <div className="bg-gray-200 h-0.5 w-[60%] m-auto"></div>
              <div className="min-w-[320px] overflow-auto">
                <table className="m-auto text-xl">
                  <thead className="border-bottom border-gray-200 ">
                    <tr>
                      <th className="px-4 py-3 text-center"></th>
                      <th className="px-4 py-3 text-center">
                        <div className="text-truncate">Rank</div>
                      </th>
                      <th className="px-4 py-3">
                        <div className="text-truncate w-[250px]">Team Name & Manager</div>
                      </th>
                      <th className="px-4 py-3 text-center">
                        <div className="text-truncate">Points</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {data?.standings?.map((entrant, idx) => (
                      <tr
                        className="border-bottom border-gray-200"
                        style={{
                          background: `${
                            userInfo._id === entrant.manager.user.toString()
                              ? "#ffd70063"
                              : "white"
                          }`,
                        }}
                        key={entrant._id}
                      >
                        <td className="px-4 py-3 text-center">
                          {
                            <div>
                              {(entrant?.oldRank === entrant?.rank ||
                                entrant?.oldRank === 0) && (
                                <AiFillCaretRight color="#aaa" />
                              )}
                              {entrant?.rank < entrant?.oldRank &&
                                entrant?.oldRank !== 0 && (
                                  <AiFillCaretUp color="green" />
                                )}
                              {entrant?.rank > entrant?.oldRank &&
                                entrant?.oldRank !== 0 && (
                                  <AiFillCaretDown color="red" />
                                )}
                            </div>
                          }
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div>{entrant?.rank}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-[250px]">
                            <Link
                              to={`/points/${entrant.manager._id.toString()}/matchday/${currentId}`}
                            >
                              <div>
                                <div className="text-truncate">{entrant?.manager?.teamName}</div>
                                <div className="text-truncate">
                                  {entrant?.manager?.firstName}&nbsp;&nbsp;
                                  {entrant?.manager?.lastName}
                                </div>
                              </div>
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-truncate">
                          <div>{entrant?.overallPoints}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </Button>
            <span className="text-sm px-2 py-1">
              Page {page} of {data?.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === data?.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      }

      
        <div>
          {data?.entrants?.length > 0 && (
            <>
              <div className="text-xl text-center mt-2 p-2 font-semibold">
                {data?.entrants?.length}&nbsp;
                {data?.entrants?.length > 1 ? "managers" : "manager"} to be
                added on next update
              </div>
              <div className="standing-grid font-semibold text-xl p-2">
                <div className="standing-grid-name">Team Name</div>
                <div className="standing-grid-name">Manager</div>
              </div>
              {data?.entrants?.map((entrant) => (
                <div key={entrant._id}>
                  <div className="standing-grid text-xl">
                    <div className="standing-grid-name">
                      {entrant?.teamName}
                    </div>
                    <div className="standing-grid-name">
                      {entrant?.firstName}&nbsp;&nbsp;{entrant?.lastName}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      *
    </>
  );
};

export default OverallLeague;
