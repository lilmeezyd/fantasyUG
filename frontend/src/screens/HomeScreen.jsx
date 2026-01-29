import { useEffect, useState, useMemo } from "react";
import LoginScreen from "./LoginScreen";
import { useSelector } from "react-redux";
import TeamOfWeek from "../components/TeamOfWeek";
import StarsOfWeek from "../components/StarsOfWeek";
import { useGetNextMatchdayDetailsQuery } from "../slices/transferApiSlice";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import PlayerDetailsData from "../components/PlayerDetailsData";
import HomeScreenData from "../components/HomeScreenData";
import { useGetPlayerQuery } from "../slices/playerApiSlice";
const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data = [], isLoading: nextIsLoading } = useGetNextMatchdayDetailsQuery();
  const { data: players, isLoading } = useGetPlayersQuery()
  const [show, setShow] = useState(false);
  const [showPInfo, setShowPInfo] = useState(false);
  const [ playerId, setPlayerId ] = useState('')
  const { data: player = {} } = useGetPlayerQuery(playerId);
  const mostCaptained = useMemo(() => {
    if(players) {
      const playerMap = new Map(players?.updatedPlayers?.map(x => [x._id, x]))
      const highest = Math.max(...players?.lives?.map(x => x?._id))
      const highestObj = players?.lives?.find(x => x._id === highest)
      return highestObj?.mostCaptained?.map(x => {
        return {
          ...x,
          ...playerMap.get(x?.player)
        }
      })
    }
    return []
  }, [players])
  const transfersIn = useMemo(() => {
    if(data?.transfersIn?.length) {
      const newData = [...data?.transfersIn]
      return newData?.sort((x,y) => y.transfersIn - x.transfersIn) || [];
    }
    return []
      
    }, [data])
    const transfersOut = useMemo(() => {
      if(data?.transfersOut?.length) {
        const newData = [...data?.transfersOut]
      return newData?.sort((x,y) => y.transfersOut - x.transfersOut) || [];
      }
      return []
      
    }, [data])
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
        <div className="p-2 home-section-sub">
          <div className="home-section-grid-sub my-2">
            <div>
              <h4 className="p-2">Highest Owned</h4>
              { isLoading ? (<p className="text-center font-bold">Loading...</p>) : (players?.highestOwned?.length > 0 ? (
                <>
                <div className="player-header-1">
                  <div className="info"></div>
                  <div className="position-table-1">
                    <div className="p-t-1">Player</div>
                  </div>
                  <div className="money"></div>
                  <div className="others">Ownership</div>
                </div>
                <HomeScreenData screenData={players?.highestOwned} pageSize={1} details={'highestDetails'} />
                </>
              ) : (
                "No Data yet"
              )) }
            </div>
          </div>
          <div className="home-section-grid-sub my-2">
            <div>
              <h4 className="p-2">Most Captained</h4>
              {isLoading ? (<p className="text-center font-bold">Loading...</p>) : (mostCaptained.length > 0 ? (
              <>
                <div className="player-header-1">
                  <div className="info"></div>
                  <div className="position-table-1">
                    <div className="p-t-1">Player</div>
                  </div>
                  <div className="money"></div>
                  <div className="others">Managers</div>
                </div>
                <HomeScreenData screenData={mostCaptained} pageSize={1} details={'captaincy'} />
              </>
            ) : (
              "No Transfer records"
            ))}
            </div>
          </div>
          {/*<div className="home-section-grid-sub">
            <div>
              <h4 className="p-2">Most Transferred IN</h4>
            </div>
          </div>
          <div className="home-section-grid-sub">
            <div>
              <h4 className="p-2">Most Transferred OUT</h4>
            </div>
          </div>*/}
        </div>
        <TeamOfWeek />
      </div>
      <div className="home-section py-2">
        <div className="p-2 home-section-sub">
          <div>
            <h4 className="p-2">Transfers IN</h4>
            {nextIsLoading ? (<p className="text-center font-bold">Loading...</p>) : (transfersIn.length > 0 ? (
              <>
                <div className="player-header-1">
                  <div className="info"></div>
                  <div className="position-table-1">
                    <div className="p-t-1">Player</div>
                  </div>
                  <div className="money"></div>
                  <div className="others">Transfers</div>
                </div>
                <HomeScreenData screenData={transfersIn} pageSize={5} details={'transferDetailsIn'} />
              </>
            ) : (
              "No Transfer records"
            ))}
          </div>
        </div>
        <div className="p-2 home-section-sub">
          <div>
            <h4 className="p-2">Transfers OUT</h4>
            {nextIsLoading ? (<p className="text-center font-bold">Loading...</p>) : (transfersOut.length > 0 ? (
              <>
                <div className="player-header-1">
                  <div className="info"></div>
                  <div className="position-table-1">
                    <div className="p-t-1">Player</div>
                  </div>
                  <div className="money"></div>
                  <div className="others">Transfers</div>
                </div>
                <HomeScreenData screenData={transfersOut} pageSize={5} details={'transferDetailsOut'} />
              </>
            ) : (
              "No Transfer records"
            ))}
          </div>
        </div>
      </div>
      <StarsOfWeek />
    </>
  );
};

export default HomeScreen;
