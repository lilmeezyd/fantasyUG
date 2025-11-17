import { useState, useMemo, useEffect } from "react";
import { useGetQuery } from "../slices/teamApiSlice";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useGetTotalQuery } from "../slices/userApiSlice";
import { useGetTransfersQuery } from "../slices/transferApiSlice";
import {
  AiFillCaretRight,
  AiFillCaretDown,
  AiFillCaretUp,
} from "react-icons/ai";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
const LeagueDetails = (props) => {
  const {
    privateLeagues,
    overallLeagues,
    teamLeagues,
    teamName,
    teamValue,
    bank,
    overallPoints,
    id,
    matchdayPoints,
    overallRank,
    firstName,
    lastName,
  } = props;
  const [show, setShow] = useState(false);
  const [page, setPage] = useState(1);
  const [copy, setCopy] = useState([]);
  const pageSize = 5;
  const { data: teams } = useGetQuery();
  const { data: totalPlayers } = useGetTotalQuery();
  const { data: transferObj = {} } = useGetTransfersQuery(id);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  useEffect(() => {
    const copyFix =
      transferObj?.transfers?.length > 0 ? [...transferObj?.transfers] : [];
    copyFix?.sort((x, y) => (x?.createdAt > y?.createdAt ? 1 : -1));
    setCopy(copyFix);
  }, [transferObj]);
  const toggleView = () => {
    setShow((prev) => !prev);
  };
  const onDecrement = () => {
    setPage((prevState) => prevState - 1);
  };

  const onIncrement = () => {
    setPage((prevState) => prevState + 1);
  };

  const transferList = useMemo(() => {
    return copy?.filter(
      (x, idx) => idx >= (page - 1) * pageSize && idx < page * pageSize
    );
  }, [copy, page, pageSize]);
  console.log(transferList);
  const totalPages = Math.ceil(transferObj?.transfers?.length / pageSize);
  return (
    <div className="league-details">
      <div className="ranks">
        <div className="ld-1">
          <h5 style={{ fontWeight: 700 }}>
            {firstName}&nbsp;{lastName}
          </h5>
          <div>{teamName}</div>
        </div>
        <div>
          <h5 className="ld-2">Ranking</h5>
          <div className="my-ranking">
            <div>Total points</div>
            <div>{overallPoints}</div>
          </div>
          {overallLeagues?.length > 0 && (
            <div className="my-ranking">
              <div>Overall rank</div>
              <div>
                {overallLeagues[0]?.currentRank === null
                  ? "-"
                  : overallLeagues[0]?.currentRank}
              </div>
            </div>
          )}
          <div className="my-ranking">
            <div>Total players</div>
            <div>{totalPlayers?.total}</div>
          </div>
          <div className="my-ranking">
            <div>Matchday points</div>
            <div>{matchdayPoints}</div>
          </div>
        </div>
      </div>

      <div className="ld">
        <div>
          <h5 className="ld-2">General Leagues</h5>
          <div className="my-leagues">
            <div></div>
            <div>Rank</div>
            <div>League</div>
          </div>
          {overallLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div>
                {(x.currentRank === x.lastRank || x.lastRank === null) && (
                  <AiFillCaretRight color="#aaa" />
                )}
                {x.currentRank < x.lastRank && x.lastRank !== null && (
                  <AiFillCaretUp color="green" />
                )}
                {x.currentRank > x.lastRank && x.lastRank !== null && (
                  <AiFillCaretDown color="red" />
                )}
              </div>
              <h6>{x.currentRank === null ? "-" : x.currentRank}</h6>
              <Link to={`/userleagues/overall/${x.id}`}>
                <h6>{x.name}</h6>
              </Link>
            </div>
          ))}
          {teamLeagues?.map((x) => (
            <div className="my-leagues" key={x._id}>
              <div>
                {(x.currentRank === x.lastRank || x.lastRank === null) && (
                  <AiFillCaretRight color="#aaa" />
                )}
                {x.currentRank < x.lastRank && x.lastRank !== null && (
                  <AiFillCaretUp color="green" />
                )}
                {x.currentRank > x.lastRank && x.lastRank !== null && (
                  <AiFillCaretDown color="red" />
                )}
              </div>
              <h6>{x.currentRank === null ? "-" : x.currentRank}</h6>
              <Link to={`/userleagues/team/${x.id}`}>
                <h6>{teams?.find((team) => team._id === x.team)?.name}</h6>
              </Link>
            </div>
          ))}
        </div>
        {/*<div>
          <h5 className="ld-2">Private Leagues</h5>
          {privateLeagues?.length === 0 ? (
            <div className="ld-1">Create or join a private league</div>
          ) : (
            <>
              <div className="my-leagues">
                <div></div>
                <div>Rank</div>
                <div>League</div>
              </div>
              {privateLeagues?.map((x) => (
                <div className="my-leagues" key={x._id}>
                  <div>
                  {x.currentRank === x.lastRank ? <AiFillCaretRight color="#aaa"/> : 
                x.currentRank > x.lastRank ? <AiFillCaretUp color="green" /> : 
                <AiFillCaretDown color="red" />}
                  </div>
                  <h6>{x.currentRank === null ? '-' : x.currentRank}</h6>
                  <Link to={`/userleagues/private/${x.id}`}><h6>{x.name}</h6></Link>
                </div>
              ))}
            </>
          )}
        </div>*/}
      </div>

      <div className="ld">
        <h5 className="ld-2">Finances</h5>
        <div className="my-ranking">
          <div>Team value</div>
          <div>UGX&nbsp;{teamValue?.toFixed(1)}M</div>
        </div>
        <div className="my-ranking">
          <div>In the bank</div>
          <div>UGX&nbsp;{bank?.toFixed(1)}M</div>
        </div>
      </div>

      <div className="ld">
        <h5 className="ld-2">Transfers</h5>
        <div className="my-ranking">
          <div>Total Transfers</div>
          <div>{transferObj?.totalTransfers}</div>
        </div>
        <div className="my-ranking">
          <div>Gameweek Transfers</div>
          <div>{transferObj?.matchdayTransfersLength}</div>
        </div>
        <div className="transfer-history">
          <Link to="" onClick={toggleView}>
            <h6>Transfer History</h6>
          </Link>
        </div>
      </div>

      {show && (transferList?.length === 0 ? 
      <div className="my-ranking">No transfers made yet</div> :
        <div className="ld">
          <section className="btn-wrapper p-2">
            <button
              disabled={page === 1 ? true : false}
              onClick={onDecrement}
              className={`${page === +1 && "btn-hide"} btn-controls`}
              id="prevButton"
            >
              <BsChevronLeft />
            </button>
            <button
              disabled={page === totalPages ? true : false}
              onClick={onIncrement}
              className={`${page === totalPages && "btn-hide"} btn-controls`}
              id="nextButton"
            >
              <BsChevronRight />
            </button>
          </section>
          <div className="transfer-block">
            <div></div>
            <div>OUT</div>
            <div>IN</div>
          </div>
          {transferList?.map((x, idx) => (
            <div className="transfer-block-wrappper" key={idx + 1}>
              <div className="transfer-block">
                <div>{x.matchday}</div>
                <div>{x.transferOut.appName}</div>
                <div>{x.transferIn.appName}</div>
              </div>
              <div style={{borderBottom: '1px solid rgba(0,0,0,0.1)'}} className="transfer-block">
                <div></div>
                <div className="position-team">
                  <div>{x.transferOut.playerPosition}</div>
                  <div>{x.transferOut.playerTeam}</div>
                </div>
                <div className="position-team">
                  <div>{x.transferIn.playerPosition}</div>
                  <div>{x.transferIn.playerTeam}</div>
                </div>
              </div>
              <div className="transfer-time">
                {new Date(x.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeagueDetails;
