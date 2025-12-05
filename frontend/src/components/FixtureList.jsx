import { useState, useEffect } from "react";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice";
import { Spinner } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import FixtureItem from "./FixtureItem";
const FixtureList = (props) => {
  const { mdParam } = props;
  const [page, setPage] = useState(1);
  const [minGW, setMinGW] = useState(1);
  const [maxGW, setMaxGW] = useState(1);
  const [copy, setCopy] = useState([]);
  const { data: fixtures, isLoading } = useGetFixturesQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  useEffect(() => {
    const sorted = fixtures?.length ? [...fixtures] : [];
    sorted.sort((a, b) => (a.kickOffTime > b.kickOffTime ? 1 : -1));
    setCopy(sorted);
  }, [fixtures]);

  useEffect(() => {
    const ids = matchdays?.map((m) => Number(m.id)) ?? [];
    const smallest = ids.length ? Math.min(...ids) : 1;
    const largest = ids.length ? Math.max(...ids) : 1;

    const nextMatchday = matchdays?.find((m) => m.next);
    const nextId = nextMatchday ? Number(nextMatchday.id) : largest;

    const pageValue = mdParam === "next" ? nextId : Number(mdParam);

    setPage(pageValue);
    setMinGW(smallest);
    setMaxGW(largest);
  }, [matchdays, mdParam]);

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
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="fix-body">
      {copy.length > 0 && (
        <section className="btn-wrapper p-2">
          <button
            disabled={page === minGW ? true : false}
            onClick={onDecrement}
            className={`${page === +minGW && "btn-hide"} btn-controls`}
            id="prevButton"
          >
            <BsChevronLeft />
          </button>
          <button
            disabled={page === maxGW ? true : false}
            onClick={onIncrement}
            className={`${page === maxGW && "btn-hide"} btn-controls`}
            id="nextButton"
          >
            <BsChevronRight />
          </button>
        </section>
      )}
      {copy
        ?.filter((x) => +x?._id?.id === +page)
        ?.map((fixture) => (
          <div key={fixture?._id?._id}>
            <div className="deadline">
              <h5 className="pick-team-name home-stars">
                {fixture?._id?.name}
              </h5>
            </div>
            <div className="fix-item-bg">
              {fixture?.fixtures?.map((x, idx) => (
                <div className="fix-item" key={x._id}>
                  <div className="deadline">
                    {returnDay(fixture?.fixtures, idx)}
                  </div>
                  <FixtureItem x={x} />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default FixtureList;
