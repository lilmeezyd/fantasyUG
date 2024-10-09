import { useMemo, useState, Suspense, useReducer } from "react";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetPositionsQuery } from "../slices/positionApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import { Spinner, Container } from "react-bootstrap";
import Pagination from "./Pagination";
import PlayerCard from "./PlayerCard";
import {
  getMinMax,
  getPlayers,
  getArrangedPlayers,
} from "../helpers/playersHelper";
import { useGetTotalQuery } from "../slices/userApiSlice";

const Players = (props) => {
  const { addPlayer, removePlayer, picks, GKP, DEF, MID, FWD, errorMsg } =
    props;
  const { data: players, isLoading } = useGetPlayersQuery();
  const { data: teams } = useGetQuery();
  const { data: elementTypes } = useGetPositionsQuery();
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const reducer = (state, action) => {
    if (action.type === "PRICE") {
      return {
        ...state,
        cutPrice: action.data,
      };
    }
    if (action.type === "WORD") {
      return {
        ...state,
        word: action.data,
      };
    }
    if (action.type === "SORT") {
      const wordObj = {
        nowCost: "Points",
        totalPoints: "Points",
        goalsScored: "Goals",
        assists: "Assists",
        yellowCards: "Yellow cards",
        redCards: "Red cards",
        penaltiesSaved: "Penalties Saved",
        penaltiesMissed: "Penalties Missed",
        cleansheets: "Clean sheets",
        ownership: "Ownership",
        ownGoals: "Own goals",
      };
      const sortWord = wordObj[action.data];
      return {
        ...state,
        sort: action.data,
        sortWord,
      };
    }
    if (action.type === "VIEW") {
      return {
        ...state,
        view: action.data,
      };
    }
  };
  const [state, dispatch] = useReducer(reducer, {
    sort: "totalPoints",
    view: "allPlayers",
    word: "",
    sortWord: "Points",
    cutPrice: 25,
  });

  const { sort, view, word, cutPrice, sortWord } = state;
  const { data: totalPlayers } = useGetTotalQuery();

  const allPlayers = getPlayers(
    players,
    sort,
    view,
    word,
    cutPrice,
    totalPlayers
  ).returnedPlayers;
  const goalkeepers = getArrangedPlayers(
    allPlayers,
    curPage,
    pageSize
  ).goalkeepers;
  const defenders = getArrangedPlayers(allPlayers, curPage, pageSize).defenders;
  const midfielders = getArrangedPlayers(
    allPlayers,
    curPage,
    pageSize
  ).midfielders;
  const forwards = getArrangedPlayers(allPlayers, curPage, pageSize).forwards;
  const prices = getMinMax(players).prices;
  const minPrice = getMinMax(allPlayers).minPrice;
  const maxPrice = getMinMax(allPlayers).maxPrice;
  let totalPages = Math.ceil(allPlayers?.length / pageSize);

  {
    /* Button Controls */
  }
  const onSubmit = (e) => {
    e.preventDefault();
    if (page > totalPages) {
      setCurPage(totalPages);
      setPage(totalPages);
    } else if (page < 0) {
      setCurPage(1);
      setPage(1);
    } else if (+page === 0) {
      setCurPage(1);
      setPage(1);
    } else {
      setCurPage(page);
    }
  };
  const changePage = (e) => {
    if (e.target.value === "") {
      setPage("");
    } else if (e.target.value > totalPages) {
      setPage(totalPages);
    } else {
      setPage(+e.target.value);
    }
  };
  const viewNextPage = () => {
    setCurPage(curPage + 1);
    setPage(curPage + 1);
  };
  const viewPreviousPage = () => {
    setCurPage(curPage - 1);
    setPage(curPage - 1);
  };
  const viewFirstPage = () => {
    setCurPage(1);
    setPage(1);
  };

  const viewLastPage = () => {
    setCurPage(totalPages);
    setPage(totalPages);
  };

  const onPrice = (e) => {
    dispatch({ type: "PRICE", data: +e.target.value });
    setCurPage(1);
  };

  const onSearch = (e) => {
    dispatch({ type: "WORD", data: e.target.value });
    setCurPage(1);
  };

  const onSort = (e) => {
    dispatch({ type: "SORT", data: e.target.value });
    setCurPage(1);
  };

  const onView = (e) => {
    dispatch({ type: "VIEW", data: e.target.value });
    setCurPage(1);
  };

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="players-col">
        <div className="players small">
          <div className="players-container">
            <div className="players-heading-container">
              <h4 className="players-heading">Player Selection</h4>
            </div>
            <div className="plan-form">
              <form>
                <div className="view">
                  <label htmlFor="view_by">View</label>
                  <select
                    onChange={onView}
                    className="custom-select"
                    id="view_by"
                  >
                    <optgroup label="Global">
                      <option value="allPlayers">All Players</option>
                    </optgroup>
                    <optgroup label="By Position">
                      {elementTypes?.map((pPos, idx) => {
                        let positionId = "position_" + pPos._id;
                        return (
                          <option key={idx} value={positionId}>
                            {pPos.singularName + "s"}
                          </option>
                        );
                      })}
                    </optgroup>
                    <optgroup label="By Team">
                      {teams
                        ?.filter((x) => x.name !== "Neutral")
                        ?.map((team, idx) => {
                          let teamId = "team_" + team._id;
                          return (
                            <option key={idx} value={teamId}>
                              {team.name}
                            </option>
                          );
                        })}
                    </optgroup>
                  </select>
                </div>
                <div className="sort">
                  <label htmlFor="sort_by">Sorted by</label>
                  <select
                    onChange={onSort}
                    className="custom-select"
                    id="sort_by"
                  >
                    <option value="totalPoints">Total points</option>
                    <option value="nowCost">Price</option>
                    {/*<option value="event_points">Round points</option>*/}
                    <option value="ownership">%age ownership</option>
                    <option value="goalsScored">Goals</option>
                    <option value="assists">Assists</option>
                    <option value="yellowCards">Yellow cards</option>
                    <option value="redCards">Red cards</option>
                    <option value="penaltiesSaved">Penalties Saved</option>
                    <option value="penaltiesMissed">Penalties Missed</option>
                    <option value="cleansheets">Clean sheets</option>
                    <option value="ownGoals">Own Goals</option>
                  </select>
                </div>
                <div className="search">
                  <label htmlFor="search">Search</label>
                  <input
                    onChange={onSearch}
                    id="search"
                    className="blur"
                    type="text"
                    name=""
                  />
                </div>
                <div className="cost">
                  <label htmlFor="cost_by">Max cost</label>
                  <div>
                    Between <span id="pMin">{minPrice.toFixed(1)}</span> and{" "}
                    <span id="pMax">{maxPrice.toFixed(1)}</span>
                  </div>
                  <select
                    onChange={onPrice}
                    className="custom-select"
                    id="cost_by"
                  >
                    {prices.map((price, idx) => (
                      <option key={idx} value={price}>
                        {price}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Suspense fallback={<Spinner />}>
          {players?.length ? (
            <div className="player-info">
              <div className="player-numbers">
                <span className="number">{players?.length}</span>
                <span className="numbers">
                  {players?.length === 1 ? "Player" : "Players"}
                </span>
              </div>
              <div className="players-table">
                {goalkeepers.length > 0 ? (
                  <div className="table-one" id="goalkeepers">
                    <div className="player-header-1">
                      <div className="info"></div>
                      <div className="position-table-1">
                        <div className="p-t-1">Goalkeepers</div>
                      </div>
                      <div className="money">£</div>
                      <div className="others">{sortWord}</div>
                    </div>
                    <div>
                      {goalkeepers.map((goalkeeper) => {
                        let teamObj = teams?.find(
                          (x) => x._id === goalkeeper.playerTeam
                        );
                        let short_name = teamObj?.shortName;
                        let positionObj = elementTypes?.find(
                          (x) => x._id === goalkeeper.playerPosition
                        );
                        let short_pos = positionObj?.shortName;
                        /*let forwardImage = positionObj?.code === 1 ? `${teamObj?.code}_1-66`:
            `${teamObj?.code}-66`  */
                        let forwardImage = `${teamObj?.code}-66`;
                        return (
                          <PlayerCard
                            bgColor="rgb(255, 255, 0, 0.5)"
                            picks={picks}
                            GKP={GKP}
                            errorMsg={errorMsg}
                            addPlayer={addPlayer}
                            removePlayer={removePlayer}
                            key={goalkeeper?._id}
                            forwardImage={forwardImage}
                            playerPos={goalkeeper}
                            shortName={short_name}
                            shortPos={short_pos}
                            position={positionObj?.code}
                            team={teamObj?._id}
                            sort={sort}
                          ></PlayerCard>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {defenders.length > 0 ? (
                  <div className="table-one" id="defenders">
                    <div className="player-header-1">
                      <div className="info"></div>
                      <div className="position-table-1">
                        <div className="p-t-1">Defenders</div>
                      </div>
                      <div className="money">£</div>
                      <div className="others">{sortWord}</div>
                    </div>
                    <div>
                      {defenders.map((defender) => {
                        let teamObj = teams?.find(
                          (x) => x._id === defender.playerTeam
                        );
                        let short_name = teamObj?.shortName;
                        let positionObj = elementTypes?.find(
                          (x) => x._id === defender.playerPosition
                        );
                        let short_pos = positionObj?.shortName;
                        let forwardImage =
                          positionObj?.code === 1
                            ? `${teamObj?.code}_1-66`
                            : `${teamObj?.code}-66`;
                        return (
                          <PlayerCard
                            bgColor="rgb(0, 255, 0, 0.5)"
                            picks={picks}
                            DEF={DEF}
                            errorMsg={errorMsg}
                            addPlayer={addPlayer}
                            removePlayer={removePlayer}
                            key={defender?._id}
                            forwardImage={forwardImage}
                            playerPos={defender}
                            shortName={short_name}
                            shortPos={short_pos}
                            position={positionObj?.code}
                            team={teamObj?._id}
                            sort={sort}
                          ></PlayerCard>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {midfielders.length > 0 ? (
                  <div className="table-one" id="midfielders">
                    <div className="player-header-1">
                      <div className="info"></div>
                      <div className="position-table-1">
                        <div className="p-t-1">Midfielders</div>
                      </div>
                      <div className="money">£</div>
                      <div className="others">{sortWord}</div>
                    </div>
                    <div>
                      {midfielders.map((midfielder) => {
                        let teamObj = teams?.find(
                          (x) => x._id === midfielder.playerTeam
                        );
                        let short_name = teamObj?.shortName;
                        let positionObj = elementTypes?.find(
                          (x) => x._id === midfielder.playerPosition
                        );
                        let short_pos = positionObj?.shortName;
                        let forwardImage =
                          positionObj?.code === 1
                            ? `${teamObj?.code}_1-66`
                            : `${teamObj?.code}-66`;
                        return (
                          <PlayerCard
                            bgColor="rgb(0, 0, 255, 0.5)"
                            MID={MID}
                            errorMsg={errorMsg}
                            picks={picks}
                            key={midfielder?._id}
                            addPlayer={addPlayer}
                            removePlayer={removePlayer}
                            forwardImage={forwardImage}
                            playerPos={midfielder}
                            shortName={short_name}
                            shortPos={short_pos}
                            position={positionObj?.code}
                            team={teamObj?._id}
                            sort={sort}
                          ></PlayerCard>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {forwards.length > 0 ? (
                  <div className="table-one" id="forwards">
                    <div className="player-header-1">
                      <div className="info"></div>
                      <div className="position-table-1">
                        <div className="p-t-1">Forwards</div>
                      </div>
                      <div className="money">£</div>
                      <div className="others">{sortWord}</div>
                    </div>
                    <div>
                      {forwards.map((forward) => {
                        let teamObj = teams?.find(
                          (x) => x._id === forward.playerTeam
                        );
                        let short_name = teamObj?.shortName;
                        let positionObj = elementTypes?.find(
                          (x) => x._id === forward.playerPosition
                        );
                        let short_pos = positionObj?.shortName;
                        /*let forwardImage = positionObj?.code === 1 ? `${teamObj?.code}_1-66`:
            `${teamObj?.code}-66` */
                        let forwardImage = `${teamObj?.code}-66`;
                        return (
                          <PlayerCard
                            bgColor="rgb(255, 0, 0, 0.5)"
                            FWD={FWD}
                            errorMsg={errorMsg}
                            picks={picks}
                            addPlayer={addPlayer}
                            removePlayer={removePlayer}
                            key={forward?._id}
                            forwardImage={forwardImage}
                            playerPos={forward}
                            shortName={short_name}
                            shortPos={short_pos}
                            position={positionObj?.code}
                            team={teamObj?._id}
                            sort={sort}
                          ></PlayerCard>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
              <Pagination
                curPage={curPage}
                viewFirstPage={viewFirstPage}
                viewPreviousPage={viewPreviousPage}
                viewNextPage={viewNextPage}
                viewLastPage={viewLastPage}
                totalPages={totalPages}
                onSubmit={onSubmit}
                page={page}
                changePage={changePage}
              />
            </div>
          ) : (
            <div className="no-trans small">No Players Found</div>
          )}
        </Suspense>
      </div>
    </>
  );
};

export default Players;
