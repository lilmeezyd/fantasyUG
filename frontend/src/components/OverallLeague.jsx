import { useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetOverallLeagueQuery } from "../slices/leagueApiSlice";
import { useGetMaxIdQuery, useGetCurrentMDQuery } from "../slices/matchdayApiSlice";
import { Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  AiFillCaretRight,
  AiFillCaretDown,
  AiFillCaretUp,
} from "react-icons/ai";
import { useState } from "react";
const OverallLeague = () => {
  const [copy, setCopy] = useState([]);
  const [sortParam, setSortParam] = useState("overallPoints");
  const [gw, setGw] = useState(1);
  const { id } = useParams();
  const { data = [], isLoading } = useGetOverallLeagueQuery(id);
  const { data: maxId } = useGetMaxIdQuery();
  const { data: currentId } = useGetCurrentMDQuery();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const newData = data?.standings?.length > 0 ? [...data?.standings] : [];
    setCopy(newData);
  }, [data]);

  useEffect(() => {
    setGw(currentId);
  }, [currentId]);

  const start = data?.startMatchday;
  const end = data?.currentMatchday;
  const options = [];
  for (let i = start; i <= end; i++) {
    options.push(i);
  }
  const onChange = (e) => {
    setSortParam(e.target.value);
    if (e.target.value === "overallPoints") {
      setGw(maxId);
    } else {
      setGw(e.target.value);
    }
  };

  const sortedStandings = useMemo(() => {
    if (sortParam === "overallPoints") {
      return copy?.sort((x, y) => (x.overallPoints < y.overallPoints ? 1 : -1));
    } else {
      const newCopy = copy
        ?.filter((x) => {
          return Object.keys(x.matchdays).includes(sortParam);
        })
        ?.map((x) => {
          return { ...x, mdRank: x.mdRanks[sortParam] };
        });

      return newCopy?.sort((x, y) => (x.mdRank > y.mdRank ? 1 : -1));
    }
  }, [sortParam, copy]);
  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }
  return (
    <>
      <div>
        {data?.standings?.length > 0 && (
          <div>
            <div className="standing-header">
              {data?.name}&nbsp;&nbsp;Leaderboard
            </div>
            <div className="standing-header sort-options">
              <label for="sort_by">Sort By:</label>
              <div>
                <select
                  onChange={onChange}
                  className="custom-select admin-vs-select"
                  name=""
                  id="sort_by"
                >
                  <option value="overallPoints">Total Points</option>
                  {options?.map((option, idx) => (
                    <option key={idx + 1} value={option}>
                      Matchday&nbsp;{option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="standing-grid-1 standing-grid-header">
              <div></div>
              <div>Rank</div>
              <div className="standing-grid-name">Team Name</div>
              <div>MD Points</div>
              <div>Points</div>
            </div>
            {sortedStandings?.map((entrant, idx) => (
              <div
                style={{
                  background: `${
                    userInfo._id === entrant.user.toString()
                      ? "#ffd70063"
                      : "white"
                  }`,
                }}
                key={entrant._id}
                className="standing-grid-1"
              >
                {sortParam === 'overallPoints' ? <div>
                  {(entrant?.currentRank === entrant?.lastRank ||
                    entrant?.lastRank === null) && (
                    <AiFillCaretRight color="#aaa" />
                  )}
                  {entrant?.currentRank < entrant?.lastRank &&
                    entrant?.lastRank !== null && (
                      <AiFillCaretUp color="green" />
                    )}
                  {entrant?.currentRank > entrant?.lastRank &&
                    entrant?.lastRank !== null && (
                      <AiFillCaretDown color="red" />
                    )}
                </div>: <div><AiFillCaretRight color="#aaa" /></div>}
                <div>{sortParam === 'overallPoints' ? entrant?.currentRank : entrant?.mdRank}</div>
                <div className="standing-grid-name">
                  <Link to={`/points/${entrant.user.toString()}`}>
                    <div>
                      <div>{entrant?.teamName}</div>
                      <div>
                        {entrant?.firstName}&nbsp;&nbsp;{entrant?.lastName}
                      </div>
                    </div>
                  </Link>
                </div>

                <div>{entrant?.matchdays[gw]}</div>
                <div>{entrant?.overallPoints}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {data?.entrants?.length > 0 && (
          <>
            <div className="standing-header">
              {data?.entrants?.length}&nbsp;
              {data?.entrants?.length > 1 ? "managers" : "manager"} to be added
              on next update
            </div>
            <div className="standing-grid standing-grid-header">
              <div className="standing-grid-name">Team Name</div>
              <div className="standing-grid-name">Manager</div>
            </div>
            {data?.entrants?.map((entrant) => (
              <div key={entrant._id}>
                <div className="standing-grid">
                  <div className="standing-grid-name">{entrant?.teamName}</div>
                  <div className="standing-grid-name">
                    {entrant?.firstName}&nbsp;&nbsp;{entrant?.lastName}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default OverallLeague;
