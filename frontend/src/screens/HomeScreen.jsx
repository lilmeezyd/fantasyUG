import { useEffect, useState } from "react";
import LoginScreen from "./LoginScreen";
import { useSelector } from "react-redux";
import MostOwned from "../components/MostOwned";
import TeamOfWeek from "../components/TeamOfWeek";
import StarsOfWeek from "../components/StarsOfWeek";
import { useGetNextMatchdayDetailsQuery } from "../slices/transferApiSlice";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import PlayerInfo from "../components/PlayerInfo";
const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data = [] } = useGetNextMatchdayDetailsQuery();
  const { data: players = [] } = useGetPlayersQuery()
  const [transfers, setTransfers] = useState({
    transfersIn: [],
    transfersOut: [],
  });
  const [showPInfo, setShowPInfo] = useState(false);
  const { transfersIn, transfersOut } = transfers;
  useEffect(() => {
    const transIn = data?.transfersIn || [];
    const transOut = data?.transfersOut || [];
    setTransfers({ transfersIn: transIn, transfersOut: transOut });
  }, [data]);
  console.log(transfersIn);
  console.log(transfersOut);
  const handleClose = () => setShow(false);
  const getInfo = () => {
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
                <div class="player-header-1">
                  <div class="info"></div>
                  <div class="position-table-1">
                    <div class="p-t-1">Player</div>
                  </div>
                  <div class="money"></div>
                  <div class="others">Ownership</div>
                </div>
                {players?.highestOwned?.map(player => (
                  <div key={player?._id} className="player-tbh">
                    <div className="info">
                      {/* <button
                        onClick={getInfo}
                        className="player-info-button-table"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-info-square"
                          viewBox="0 0 16 16"
                        >
                          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                        </svg>
                      </button>*/}
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
                <div class="player-header-1">
                  <div class="info"></div>
                  <div class="position-table-1">
                    <div class="p-t-1">Player</div>
                  </div>
                  <div class="money"></div>
                  <div class="others">Transfers</div>
                </div>
                {transfersIn.map((transfer) => (
                  <div className="player-tbh">
                    <div className="info">
                      {/* <button
                        onClick={getInfo}
                        className="player-info-button-table"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-info-square"
                          viewBox="0 0 16 16"
                        >
                          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                        </svg>
                      </button>*/}
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
                <div class="player-header-1">
                  <div class="info"></div>
                  <div class="position-table-1">
                    <div class="p-t-1">Player</div>
                  </div>
                  <div class="money"></div>
                  <div class="others">Transfers</div>
                </div>
                {transfersOut.map((transfer) => (
                  <div className="player-tbh">
                    <div className="info">
                      {/* <button
                        onClick={getInfo}
                        className="player-info-button-table"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-info-square"
                          viewBox="0 0 16 16"
                        >
                          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                          <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                        </svg>
                      </button>*/}
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
      {/*<PlayerInfo
    player={player}
    handleCloseInfo={handleCloseInfo}
    showPInfo={showPInfo}
    ></PlayerInfo>*/}
    </>
  );
};

export default HomeScreen;
