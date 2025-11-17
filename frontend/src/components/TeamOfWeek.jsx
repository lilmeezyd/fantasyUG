import { useEffect, useState, useMemo } from "react"
import { useGetPlayersQuery } from "../slices/playerApiSlice"
import { useGetAllTOWsQuery, useGetMaxIdQuery, useGetMatchdayTOWQuery } from "../slices/matchdayApiSlice"
import { useGetMatchdaysQuery } from "../slices/matchdayApiSlice"
import { Spinner } from "react-bootstrap"
import {
  BsChevronLeft,
  BsChevronRight
} from "react-icons/bs";
import PlayerDetails from "./PlayerDetails"

const TeamOfWeek = () => {
  const [matchdayId, setMatchdayId] = useState(null)
  const { data: maxId, isLoading } = useGetMaxIdQuery()
  const { data=[], isLoading: getAllLoading } = useGetAllTOWsQuery()
  const { data: tows } = useGetMatchdayTOWQuery(matchdayId)
  const minId = 1

  useEffect(() => {
    setMatchdayId(maxId)
  }, [maxId])

  const allArray = useMemo(() => data?.filter(x => +x.matchday === +matchdayId), [matchdayId, data])

  const allArrays = useMemo(() => {
    const newOnes = []
    const all = data?.filter(x => +x.matchday === +matchdayId)
    if (all !== undefined && all.length > 0) {
      newOnes.push(...all[0].starOnes)
    }
    return newOnes.sort((a, b) => a.code > b.code ? 1 : -1)
  }, [matchdayId, data])
  console.log(data)
  const goalkeepers = allArrays?.filter(
    (pick) =>
      pick?.code
      === 1
  );
  const defenders = allArrays
    ?.filter(
      (pick) =>
        pick?.code
        === 2
    );
  const midfielders = allArrays
    ?.filter(
      (pick) =>
        pick?.code
        === 3
    );
  const forwards = allArrays
    ?.filter(
      (pick) =>
        pick?.code
        === 4
    );


  const onDecrement = () => {
    setMatchdayId(matchdayId - 1)
  };

  const onIncrement = () => {
    setMatchdayId(matchdayId + 1)
  };

/*
  if (isLoading || getAllLoading || !data?.length) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    )
  }*/
/*console.log(allArray)
  if (data?.length === 0) {
    return (
      <div className="home-section-sub" style={{fontWeight: 800}}>
        No stars of the matchday yet
      </div>
    )
  }*/

  return (
    <>
      {data?.length === 0 ? (<div className="home-section-sub" style={{fontWeight: 800,
        display: "grid", placeItems: "center"
      }}>
        No stars of the matchday yet
      </div>)
      :(<div className="home-section-sub">
        <section className="btn-wrapper p-2">
          <button
            disabled={matchdayId === minId ? true : false}
            onClick={onDecrement}
            className={`${matchdayId === +minId && "btn-hide"} btn-controls`}
            id="prevButton"
          >
            <BsChevronLeft />
          </button>
          <button
            disabled={matchdayId === +maxId ? true : false}
            onClick={onIncrement}
            className={`${matchdayId === +maxId && "btn-hide"} btn-controls`}
            id="nextButton"
          >
            <BsChevronRight />
          </button>
        </section>
        <h6 className="home-stars">Stars of Matchday {allArray[0]?.matchday}</h6>
        <div className="default-player">
          {goalkeepers?.map((x) => (
            <div key={x.id} className="squad-player">
              <PlayerDetails
                playerId={x.id}
                totalPoints={x.totalPoints}
              />
            </div>
          ))}
        </div>
        <div className="default-player">
          {defenders?.map((x) => (
            <div key={x.id} className="squad-player">
              <PlayerDetails
                playerId={x.id}
                totalPoints={x.totalPoints}
              />
            </div>
          ))}
        </div>
        <div className="default-player">
          {midfielders?.map((x) => (
            <div key={x.id} className="squad-player">
              <PlayerDetails
                playerId={x.id}
                totalPoints={x.totalPoints}
              />
            </div>
          ))}
        </div>
        <div className="default-player">
          {forwards?.map((x) => (
            <div key={x.id} className="squad-player">
              <PlayerDetails
                playerId={x.id}
                totalPoints={x.totalPoints}
              />
            </div>
          ))}
        </div>
      </div>)}
    </>
  )
}

export default TeamOfWeek
