import { useState, useEffect } from "react";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { Spinner } from "react-bootstrap";
import {
  BsChevronLeft,
  BsChevronRight
} from "react-icons/bs";
import FixtureItem from "./FixtureItem";
const FixtureList = () => {
  const [page, setPage] = useState(1);
  const [copy, setCopy] = useState([]);
  const { data: fixtures, isLoading } = useGetFixturesQuery();
  useEffect(() => {
    const copyFix = fixtures?.length > 0 ? [...fixtures] : [];
    copyFix?.sort((x, y) => (x?.deadlineTime > y?.deadlineTime ? 1 : -1));
    setCopy(fixtures);
  }, [fixtures]);

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
              <h4 className="pick-team-name">{fixture?._id?.name}</h4>
            </div>
            <div>
              {fixture?.fixtures?.map((x, idx) => (
                <div key={x._id}>
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
