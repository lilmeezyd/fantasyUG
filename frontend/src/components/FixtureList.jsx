import { useState, useEffect } from "react";
import { useGetFixturesQuery } from "../slices/fixtureApiSlice";
import { Spinner } from "react-bootstrap";
import {
  BsChevronLeft,
  BsChevronRight
} from "react-icons/bs";
import FixtureItem from "./FixtureItem";
const FixtureList = (props) => {
  const { mdParam } = props
  const [page, setPage] = useState(1);
  const [copy, setCopy] = useState([]); 
  const { data: fixtures, isLoading } = useGetFixturesQuery();
  //const md = matchdays?.find(matchday => matchday?.next === true)
  useEffect(() => {
    const copyFix = fixtures?.length > 0 ? [...fixtures] : [];
    copyFix?.sort((x, y) => (x?.kickOffTime > y?.kickOffTime ? 1 : -1));
    mdParam === 'next' ? 
    setPage(copyFix?.find(x => x?._id?.[mdParam] === true)?._id?.id) :
    setPage(mdParam)
    setCopy(fixtures);
  }, [fixtures, mdParam]);
  /*console.log(mdParam)
  console.log(copy)
  console.log(page)*/

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
              <h5 className="pick-team-name home-stars">{fixture?._id?.name}</h5>
            </div>
            <div  className="fix-item-bg">
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
