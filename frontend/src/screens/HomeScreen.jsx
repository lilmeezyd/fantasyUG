import { useEffect, useState, useMemo } from "react";
import LoginScreen from "./LoginScreen";
import { useSelector } from "react-redux";
import TeamOfWeek from "../components/TeamOfWeek";
import StarsOfWeek from "../components/StarsOfWeek";
import { useGetNextMatchdayDetailsQuery } from "../slices/transferApiSlice";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import PlayerDetailsData from "../components/PlayerDetailsData";
import { useGetPlayerQuery } from "../slices/playerApiSlice";
const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data = [] } = useGetNextMatchdayDetailsQuery();
  const { data: players = [], isLoading } = useGetPlayersQuery()
  const [transfers, setTransfers] = useState({
    transfersIn: [],
    transfersOut: [],
  });
  const [show, setShow] = useState(false);
  const [showPInfo, setShowPInfo] = useState(false);
  const [ playerId, setPlayerId ] = useState('')
  const { data: player = {} } = useGetPlayerQuery(playerId);
 /* const { transfersIn, transfersOut } = transfers;
  useEffect(() => {
    const transIn = data?.transfersIn || [];
    const transOut = data?.transfersOut || [];
    setTransfers({ transfersIn: transIn, transfersOut: transOut });
  }, [data]);*/
  const transfersIn = useMemo(() => {
    if(data?.transfersIn?.length) {
      const newData = [...data?.transfersIn]
      return newData?.sort((x,y) => y.transfersIn - x.transfersIn)?.slice(0,4) || [];
    }
    return []
      
    }, [data])
    const transfersOut = useMemo(() => {
      if(data?.transfersOut?.length) {
        const newData = [...data?.transfersOut]
      return newData?.sort((x,y) => y.transfersOut - x.transfersOut)?.slice(0,4) || [];
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
        <div className="p-2 home-section-sub home-section-grid">
          <div className="home-section-grid-sub">
            <div>
              <h4 className="p-2">Highest Owned</h4>
              { players?.highestOwned?.length > 0 ? (
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
                  <PlayerDetailsData details={'highestDetails'} key={player._id} playerData={player} playerId={player._id} />
                ))}
                </>
              ) : (
                "No Data yet"
              ) }
            </div>
          </div>
          {/*<div className="home-section-grid-sub">
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
          </div>*/}
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
                   <PlayerDetailsData details={'transferDetailsIn'} key={transfer._id} playerData={transfer} playerId={transfer._id} />
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
                  <PlayerDetailsData details={'transferDetailsOut'} playerData={transfer} key={transfer._id} playerId={transfer._id} />
                ))}
              </>
            ) : (
              "No Transfer records"
            )}
          </div>
        </div>
      </div>
      <StarsOfWeek />
    </>
  );
};

export default HomeScreen;
