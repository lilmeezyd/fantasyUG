import { useMemo, useState, useEffect } from "react";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import {
  BsChevronLeft,
  BsChevronRight,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
} from "react-icons/bs";
import getTime from "../utils/getTime";
import { getPm, getPmString } from "../utils/getPm";
const FixtureList = () => {
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, displayStats] = useState(false);
  const [copy, setCopy] = useState([]);
  const { data: fixtures, isLoading } = useGetFixturesQuery();
  const { data: teams } = useGetQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  useEffect(() => {
    const copyFix = fixtures?.length > 0 ? [...fixtures] : [];
    copyFix?.sort((x, y) => (x?.deadlineTime > y?.deadlineTime ? 1 : -1));
    setCopy(fixtures);
  }, [fixtures]);

  const onClick = () => {
    displayStats((prevState) => !prevState);
  };

  const onDecrement = () => {
    setPage((prevState) => prevState - 1);
  };

  const onIncrement = () => {
    setPage((prevState) => prevState + 1);
  };

  const returnDay = (data, idx) => {
    if (idx === 0) {
      return (
        <>
          <p className="date">{new Date(data[0].kickOffTime).toDateString()}</p>
        </>
      );
    }
    if (idx > 0) {
      return new Date(data[idx - 1].kickOffTime).toDateString() ===
        new Date(data[idx].kickOffTime).toDateString() ? (
        ""
      ) : (
        <>
          <p className="date">
            {new Date(data[idx].kickOffTime).toDateString()}
          </p>
        </>
      );
    }
  };

  if (isLoading) {
    <div className="spinner">
      <Spinner />
    </div>;
  }

  return (
    <div className="fix-body">
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
          disabled={page === fixtures?.length ? true : false}
          onClick={onIncrement}
          className={`${page === fixtures?.length && "btn-hide"} btn-controls`}
          id="nextButton"
        >
          <BsChevronRight />
        </button>
      </section>
      {copy
        ?.filter((x) => +x?._id?.id === +page)
        ?.map((fixture) => (
          <div key={fixture?._id?._id}>
            <div className="deadline">
              <div>{fixture?._id?.name}</div>
              <div>Deadline:</div>
              <div>{getTime(fixture?._id?.deadlineTime)}</div>
            </div>
            <div>
              {fixture?.fixtures?.map((x, idx) => (
                <div key={x._id}>
                  <div className="deadline">
                    {returnDay(fixture?.fixtures, idx)}
                  </div>
                  <div
                    onClick={onClick}
                    className={`${stats && "bg-teams"} teams-normal`}
                  >
                    <div className="home">
                      <div className="team">
                        {teams?.find((team) => team._id === x.teamHome)?.name}
                      </div>
                      <div className="ticker-image"></div>
                      <div
                        className={`${
                          x?.stats?.length > 0 ? "score" : "time-1"
                        }`}
                      >
                        {x?.stats?.length > 0
                          ? x?.stats
                              ?.filter((x) => x.identifier === "goalsScored")[0]
                              .home.map((x) => x.value)
                              .reduce((a, b) => a + b, 0) +
                            x?.stats
                              ?.filter((x) => x.identifier === "ownGoals")[0]
                              .away.map((x) => x.value)
                              .reduce((a, b) => a + b, 0)
                          : getPmString(
                              new Date(
                                getTime(x?.kickOffTime)
                              ).toLocaleTimeString()
                            )}
                      </div>
                    </div>
                    <div className="away">
                      <div
                        className={`${
                          x?.stats?.length > 0 ? "score" : "time-2"
                        }`}
                      >
                        {x?.stats?.length > 0
                          ? x?.stats
                              ?.filter((x) => x.identifier === "goalsScored")[0]
                              .home.map((x) => x.value)
                              .reduce((a, b) => a + b, 0) +
                            x?.stats
                              ?.filter((x) => x.identifier === "ownGoals")[0]
                              .away.map((x) => x.value)
                              .reduce((a, b) => a + b, 0)
                          : getPm(
                              new Date(
                                getTime(x?.kickOffTime)
                              ).toLocaleTimeString()
                            )}
                      </div>
                      <div className="ticker-image"></div>
                      <div className="team">
                        {teams?.find((team) => team._id === x.teamAway)?.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default FixtureList;
