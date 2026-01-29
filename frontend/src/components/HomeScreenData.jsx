import { useMemo, useState } from "react";
import PlayerDetailsData from "./PlayerDetailsData";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const HomeScreenData = (props) => {
  const { screenData, details, pageSize } = props;
  const [ page, setPage ] = useState(1)
  const pages = Math.ceil(screenData?.length/pageSize)

  const formattedData = useMemo(() => {
    let start = (page - 1) * pageSize;
    let end = page * pageSize
    return screenData.filter((x, idx) => {
        if(idx >= start && idx < end) return true
    })
  }, [screenData, page, pageSize])
  const onDecrement = () => {
    setPage(page - 1)
  }
  const onIncrement = () => {
    setPage(page + 1)
  }
  return (
    <>
      {formattedData.map((data) => (
        <PlayerDetailsData
          details={details}
          playerData={data}
          key={data._id}
          playerId={data._id}
        />
      ))}
      <section className="btn-wrapper p-2">
        <button
          disabled={page === 1 ? true : false}
          onClick={onDecrement}
          className={`${page === 1 && "btn-hide"} btn-controls`}
          id="prevButton"
        >
          <BsChevronLeft />
        </button>
        <button
          disabled={page === pages ? true : false}
          onClick={onIncrement}
          className={`${page === pages && "btn-hide"} btn-controls`}
          id="nextButton"
        >
          <BsChevronRight />
        </button>
      </section>
    </>
  );
};

export default HomeScreenData;
