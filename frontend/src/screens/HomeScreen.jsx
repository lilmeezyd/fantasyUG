import { useEffect, useState } from "react";
import LoginScreen from "./LoginScreen";
import { useSelector } from "react-redux";
import MostOwned from "../components/MostOwned";
import TeamOfWeek from "../components/TeamOfWeek";
import StarsOfWeek from "../components/StarsOfWeek";
import { useGetNextMatchdayDetailsQuery } from "../slices/transferApiSlice";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import PlayerInfo from "../components/PlayerInfo";
import { useGetPlayerQuery } from "../slices/playerApiSlice";
const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data = [] } = useGetNextMatchdayDetailsQuery();
  const { data: players = [] } = useGetPlayersQuery()
  const [transfers, setTransfers] = useState({
    transfersIn: [],
    transfersOut: [],
  });
  const [show, setShow] = useState(false);
  const [showPInfo, setShowPInfo] = useState(false);
  const [ playerId, setPlayerId ] = useState('')
  const { data: player = {} } = useGetPlayerQuery(playerId);
  const { transfersIn, transfersOut } = transfers;
  useEffect(() => {
    const transIn = data?.transfersIn || [];
    const transOut = data?.transfersOut || [];
    setTransfers({ transfersIn: transIn, transfersOut: transOut });
  }, [data]);
  const handleClose = () => setShow(false);
  const getInfo = (player) => {
    setPlayerId(player)
    setShowPInfo(true);
    handleClose();
  };

  const handleCloseInfo = () => {
    setShowPInfo(false);
  };
  return (
    <>
      {userInfo ? (
        <div className="py-2" style={{ fontWeight: 600 }}>
          You&#39;re logged in as, {userInfo?.firstName}&nbsp;
          {userInfo?.lastName}
        </div>
      ) : (
        <LoginScreen />
      )}
      <div className="home-section p-2">
        <div className="p-2 home-section-sub home-section-grid">
          <div className="home-section-grid-sub">
            <div>
              <h4 className="p-2">Highest Owned</h4>
              {players?.highestOwned?.length > 0 ? (
                <>
                <div className="player-header-1">
                  <div className="info"></div>
                  <div className="position-table-1">
                    <div className="p-t-1">Player</div>
                  </div>
                  <div className="money"></div>
                  <div className="others">Ownership</div>
                </div>
                {players?.highestOwned?.map(player => (
                  <div key={player?._id} className="player-tbh">
                    <div className="info">
                      <button
                      onClick={() => getInfo(player?._id)}
                      className="player-info-button-table"
                    >
                      <svg
                        width="6"
                        height="13"
                        viewBox="0 0 6 13"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="yss5pg0"
                        aria-label="Player info"
                      >
                        <path
                          d="M2.22454 5.31004C2.04454 5.79123 1.86735 6.21789 1.72391 6.656C1.26548 8.05608 0.790168 9.45127 0.379072 10.8662C0.141412 11.6841 0.477041 12.237 1.18251 12.338C1.43938 12.3748 1.71688 12.3734 1.96814 12.315C3.51878 11.9549 4.20734 10.674 4.91522 9.41888C4.76334 9.53176 4.64147 9.67574 4.51256 9.81302C4.11552 10.2358 3.67396 10.597 3.1232 10.7888C3.0332 10.8199 2.8996 10.8055 2.82273 10.7548C2.78195 10.728 2.80398 10.5726 2.82695 10.4831C2.85695 10.3645 2.91601 10.2531 2.96241 10.1383C3.56522 8.64782 4.17597 7.1608 4.76385 5.66411C4.86557 5.40486 4.9326 5.09874 4.90589 4.82609C4.85667 4.32769 4.34245 3.97565 3.71245 3.98904C2.07697 4.02348 0.898571 4.85097 0.0595308 6.24002C0.0285936 6.2912 0.0285936 6.36152 0 6.48253C0.698436 5.95686 1.27534 5.32056 2.22454 5.31004ZM5.82634 2.07176C5.82634 2.93942 5.13681 3.64302 4.28602 3.64302C3.43571 3.64302 2.74618 2.93942 2.74618 2.07176C2.74618 1.20362 3.43571 0.5 4.28602 0.5C5.1368 0.5 5.82634 1.2036 5.82634 2.07176Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                    </div>
                    <div className="position-table-1">
                      <button
                        style={{ fontWeight: "700" }}
                        className="player-cell btn-table"
                      >
                        <div className="images">
                          <img
                            src={`../shirt_${player.forwardImage}.svg`}
                            alt={player.forwardImage}
                          />
                        </div>
                        <div className="player-cell-info">
                          <div className="name-1">{player.appName}</div>
                          <div className="player-cell-details">
                            <div className="team_name">
                              {player.playerTeamName}
                            </div>
                            <div className="position">
                              {player.playerPositionName}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div></div>
                    <div className="points others">{player.ownership}%</div>
                  </div>
                ))}
                </>
              ) : (
                "No Data yet"
              ) }
            </div>
          </div>
          <div className="home-section-grid-sub">
            <div>
              <h4 className="p-2">Most Captained</h4>
            </div>
          </div>
          <div className="home-section-grid-sub">
            <div>
              <h4 className="p-2">Most Transferred IN</h4>
            </div>
          </div>
          <div className="home-section-grid-sub">
            <div>
              <h4 className="p-2">Most Transferred OUT</h4>
            </div>
          </div>
        </div>
        <TeamOfWeek />
      </div>
      <div className="home-section py-2">
        <div className="p-2 home-section-sub">
          <div>
            <h4 className="p-2">Transfers IN</h4>
            {transfersIn.length > 0 ? (
              <>
                <div className="player-header-1">
                  <div className="info"></div>
                  <div className="position-table-1">
                    <div className="p-t-1">Player</div>
                  </div>
                  <div className="money"></div>
                  <div className="others">Transfers</div>
                </div>
                {transfersIn.map((transfer) => (
                  <div key={transfer?._id} className="player-tbh">
                    <div className="info">
                      <button
                      onClick={() => getInfo(transfer?._id)}
                      className="player-info-button-table"
                    >
                      <svg
                        width="6"
                        height="13"
                        viewBox="0 0 6 13"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="yss5pg0"
                        aria-label="Player info"
                      >
                        <path
                          d="M2.22454 5.31004C2.04454 5.79123 1.86735 6.21789 1.72391 6.656C1.26548 8.05608 0.790168 9.45127 0.379072 10.8662C0.141412 11.6841 0.477041 12.237 1.18251 12.338C1.43938 12.3748 1.71688 12.3734 1.96814 12.315C3.51878 11.9549 4.20734 10.674 4.91522 9.41888C4.76334 9.53176 4.64147 9.67574 4.51256 9.81302C4.11552 10.2358 3.67396 10.597 3.1232 10.7888C3.0332 10.8199 2.8996 10.8055 2.82273 10.7548C2.78195 10.728 2.80398 10.5726 2.82695 10.4831C2.85695 10.3645 2.91601 10.2531 2.96241 10.1383C3.56522 8.64782 4.17597 7.1608 4.76385 5.66411C4.86557 5.40486 4.9326 5.09874 4.90589 4.82609C4.85667 4.32769 4.34245 3.97565 3.71245 3.98904C2.07697 4.02348 0.898571 4.85097 0.0595308 6.24002C0.0285936 6.2912 0.0285936 6.36152 0 6.48253C0.698436 5.95686 1.27534 5.32056 2.22454 5.31004ZM5.82634 2.07176C5.82634 2.93942 5.13681 3.64302 4.28602 3.64302C3.43571 3.64302 2.74618 2.93942 2.74618 2.07176C2.74618 1.20362 3.43571 0.5 4.28602 0.5C5.1368 0.5 5.82634 1.2036 5.82634 2.07176Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                    </div>
                    <div className="position-table-1">
                      <button
                        style={{ fontWeight: "700" }}
                        className="player-cell btn-table"
                      >
                        <div className="images">
                          <img
                            src={`../shirt_${transfer.forwardImage}.svg`}
                            alt={transfer.forwardImage}
                          />
                        </div>
                        <div className="player-cell-info">
                          <div className="name-1">{transfer.appName}</div>
                          <div className="player-cell-details">
                            <div className="team_name">
                              {transfer.playerTeam}
                            </div>
                            <div className="position">
                              {transfer.playerPosition}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div></div>
                    <div className="points others">{transfer.transfersIn}</div>
                  </div>
                ))}
              </>
            ) : (
              "No Transfer records"
            )}
          </div>
        </div>
        <div className="p-2 home-section-sub">
          <div>
            <h4 className="p-2">Transfers OUT</h4>
            {transfersOut.length > 0 ? (
              <>
                <div className="player-header-1">
                  <div className="info"></div>
                  <div className="position-table-1">
                    <div className="p-t-1">Player</div>
                  </div>
                  <div className="money"></div>
                  <div className="others">Transfers</div>
                </div>
                {transfersOut.map((transfer) => (
                  <div key={transfer?._id} className="player-tbh">
                    <div className="info">
                      <button
                      onClick={() => getInfo(transfer?._id)}
                      className="player-info-button-table"
                    >
                      <svg
                        width="6"
                        height="13"
                        viewBox="0 0 6 13"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="yss5pg0"
                        aria-label="Player info"
                      >
                        <path
                          d="M2.22454 5.31004C2.04454 5.79123 1.86735 6.21789 1.72391 6.656C1.26548 8.05608 0.790168 9.45127 0.379072 10.8662C0.141412 11.6841 0.477041 12.237 1.18251 12.338C1.43938 12.3748 1.71688 12.3734 1.96814 12.315C3.51878 11.9549 4.20734 10.674 4.91522 9.41888C4.76334 9.53176 4.64147 9.67574 4.51256 9.81302C4.11552 10.2358 3.67396 10.597 3.1232 10.7888C3.0332 10.8199 2.8996 10.8055 2.82273 10.7548C2.78195 10.728 2.80398 10.5726 2.82695 10.4831C2.85695 10.3645 2.91601 10.2531 2.96241 10.1383C3.56522 8.64782 4.17597 7.1608 4.76385 5.66411C4.86557 5.40486 4.9326 5.09874 4.90589 4.82609C4.85667 4.32769 4.34245 3.97565 3.71245 3.98904C2.07697 4.02348 0.898571 4.85097 0.0595308 6.24002C0.0285936 6.2912 0.0285936 6.36152 0 6.48253C0.698436 5.95686 1.27534 5.32056 2.22454 5.31004ZM5.82634 2.07176C5.82634 2.93942 5.13681 3.64302 4.28602 3.64302C3.43571 3.64302 2.74618 2.93942 2.74618 2.07176C2.74618 1.20362 3.43571 0.5 4.28602 0.5C5.1368 0.5 5.82634 1.2036 5.82634 2.07176Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                    </div>
                    <div className="position-table-1">
                      <button
                        style={{ fontWeight: "700" }}
                        className="player-cell btn-table"
                      >
                        <div className="images">
                          <img
                            src={`../shirt_${transfer.forwardImage}.svg`}
                            alt={transfer.forwardImage}
                          />
                        </div>
                        <div className="player-cell-info">
                          <div className="name-1">{transfer.appName}</div>
                          <div className="player-cell-details">
                            <div className="team_name">
                              {transfer.playerTeam}
                            </div>
                            <div className="position">
                              {transfer.playerPosition}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                    <div></div>
                    <div className="points others">{transfer.transfersOut}</div>
                  </div>
                ))}
              </>
            ) : (
              "No Transfer records"
            )}
          </div>
        </div>
      </div>
      <StarsOfWeek />
      <PlayerInfo
    player={player}
    handleCloseInfo={handleCloseInfo}
    showPInfo={showPInfo}
    ></PlayerInfo>
    </>
  );
};

export default HomeScreen;
