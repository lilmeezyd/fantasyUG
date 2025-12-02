import { useEffect, useReducer, useRef, useState } from "react";
import { useGetPlayersQuery } from "../slices/playerApiSlice";
import { useGetQuery } from "../slices/teamApiSlice";
import PicksPlatform from "../components/PicksPlatform";
import Players from "../components/Players";
import { useGetPicksQuery } from "../slices/picksSlice";
import { Spinner, Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import FixtureList from "../components/FixtureList";

const Transfers = () => {
  const playersRef = useRef(null);
  const upRef = useRef(null);
  const [ platform, setPlatform ] = useState({playersPlatform: false, picksPlatform: true})
  const [ isSmallScreen, setIsSmallScreen ] = useState(window.innerWidth < 768)
  const [transferView, setTransferView] = useState("");
  const { data: players } = useGetPlayersQuery();
  const { data: teams } = useGetQuery();
  const { userInfo } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetPicksQuery(userInfo?._id);
  const reducer = (state, action) => {
    const ids = state.originalPicks?.map((x) => x._id);
    if (action.type === "INITIAL_PICKS") {
      return action.payload;
    }
    if (action.type === "GKP_ADD" && state.GKP < 2) {
      const { data } = action;
      if (ids.includes(data._id)) {
        const yourSlot = state.originalPicks.find(
          (x) => x._id === data._id
        ).slot;
        const slotTaken = state.picks.find((x) => x.slot === yourSlot)?._id;
        const yourSlotIndex = state.picks.findIndex((x) => x.slot === yourSlot);
        const openSlot = state.picks.findIndex(
          (x) => x._id === "" && x.playerPosition === 1
        );
        if (slotTaken.trim()) {
          const newPlayer = { ...state.picks[openSlot], ...data };
          const resident = state.picks.find((x) => x.slot === yourSlot);
          const {
            slot: rSlot,
            IsCaptain: rC,
            IsViceCaptain: rVC,
            multiplier: rM,
          } = resident;
          const {
            slot: nSlot,
            IsCaptain: nC,
            IsViceCaptain: nVC,
            multiplier: nM,
          } = newPlayer;
          const superRes = {
            ...resident,
            slot: nSlot,
            IsCaptain: nC,
            IsViceCaptain: nVC,
            multiplier: nM,
          };
          const superPlayer = {
            ...newPlayer,
            slot: rSlot,
            IsCaptain: rC,
            IsViceCaptain: rVC,
            multiplier: rM,
          };
          const resInTrans = state.transfersIn.findIndex(
            (x) => x._id === resident._id
          );
          return {
            ...state,
            transfersIn: state.transfersIn.map((x) =>
              x._id === resident._id ? superRes : x
            ),
            transfersOut: state.transfersOut.filter((x) => x._id !== data._id),
            picks: state.picks.map((x, idx) =>
              idx === openSlot
                ? (x = superRes)
                : idx === yourSlotIndex
                ? (x = superPlayer)
                : x
            ),
            GKP: state.GKP + 1,
          };
        } else {
          const slotIndex = state.transfersOut.findIndex(
            (x) => x._id === data._id
          );
          const newPlayer = { ...state.picks[yourSlotIndex], ...data };
          return {
            ...state,
            transfersIn: state.transfersIn,
            transfersOut: state.transfersOut.filter(
              (x, idx) => idx !== slotIndex
            ),
            picks: state.picks.map((x, idx) =>
              idx === yourSlotIndex ? (x = newPlayer) : x
            ),
            GKP: state.GKP + 1,
          };
        }
      } else {
        const openSlot = state.picks.findIndex(
          (x) => x._id === "" && x.playerPosition === 1
        );
        const newPlayer = { ...state.picks[openSlot], ...data };
        return {
          ...state,
          transfersIn: [...state.transfersIn, newPlayer],
          transfersOut: state.transfersOut,
          picks: state.picks.map((x, idx) =>
            idx === openSlot ? (x = newPlayer) : x
          ),
          GKP: state.GKP + 1,
        };
      }
    }
    if (action.type === "GKP_ADD" && state.GKP === 2) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of goalkeepers`,
      };
    }

    if (action.type === "DEF_ADD" && state.DEF < 5) {
      const { data } = action;
      if (ids.includes(data._id)) {
        const yourSlot = state.originalPicks.find(
          (x) => x._id === data._id
        ).slot;
        const slotTaken = state.picks.find((x) => x.slot === yourSlot)?._id;
        const yourSlotIndex = state.picks.findIndex((x) => x.slot === yourSlot);
        const openSlot = state.picks.findIndex(
          (x) => x._id === "" && x.playerPosition === 2
        );
        if (slotTaken.trim()) {
          const newPlayer = { ...state.picks[openSlot], ...data };
          const resident = state.picks.find((x) => x.slot === yourSlot);
          const {
            slot: rSlot,
            IsCaptain: rC,
            IsViceCaptain: rVC,
            multiplier: rM,
          } = resident;
          const {
            slot: nSlot,
            IsCaptain: nC,
            IsViceCaptain: nVC,
            multiplier: nM,
          } = newPlayer;
          const superRes = {
            ...resident,
            slot: nSlot,
            IsCaptain: nC,
            IsViceCaptain: nVC,
            multiplier: nM,
          };
          const superPlayer = {
            ...newPlayer,
            slot: rSlot,
            IsCaptain: rC,
            IsViceCaptain: rVC,
            multiplier: rM,
          };
          return {
            ...state,
            transfersIn: state.transfersIn.map((x) =>
              x._id === resident._id ? superRes : x
            ),
            transfersOut: state.transfersOut.filter((x) => x._id !== data._id),
            picks: state.picks.map((x, idx) =>
              idx === openSlot
                ? (x = superRes)
                : idx === yourSlotIndex
                ? (x = superPlayer)
                : x
            ),
            DEF: state.DEF + 1,
          };
        } else {
          const slotIndex = state.transfersOut.findIndex(
            (x) => x._id === data._id
          );
          const newPlayer = { ...state.picks[yourSlotIndex], ...data };
          return {
            ...state,
            transfersIn: state.transfersIn,
            transfersOut: state.transfersOut.filter(
              (x, idx) => idx !== slotIndex
            ),
            picks: state.picks.map((x, idx) =>
              idx === yourSlotIndex ? (x = newPlayer) : x
            ),
            DEF: state.DEF + 1,
          };
        }
      } else {
        const openSlot = state.picks.findIndex(
          (x) => x._id === "" && x.playerPosition === 2
        );
        const newPlayer = { ...state.picks[openSlot], ...data };
        return {
          ...state,
          transfersIn: [...state.transfersIn, newPlayer],
          transfersOut: state.transfersOut,
          picks: state.picks.map((x, idx) =>
            idx === openSlot ? (x = newPlayer) : x
          ),
          DEF: state.DEF + 1,
        };
      }
    }

    if (action.type === "DEF_ADD" && state.DEF === 5) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of defenders`,
      };
    }

    if (action.type === "MID_ADD" && state.MID < 5) {
      /*const openSlot = state.picks.findIndex(
        (x) => x._id === "" && x.playerPosition === 3
      );
      const newPlayer = { ...state.picks[openSlot], ...data };
      return {
        ...state,
        transfersIn: [...state.transfersIn, newPlayer],
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        MID: state.MID + 1,
      };*/
      const { data } = action;
      if (ids.includes(data._id)) {
        const yourSlot = state.originalPicks.find(
          (x) => x._id === data._id
        ).slot;
        const slotTaken = state.picks.find((x) => x.slot === yourSlot)?._id;
        const yourSlotIndex = state.picks.findIndex((x) => x.slot === yourSlot);
        const openSlot = state.picks.findIndex(
          (x) => x._id === "" && x.playerPosition === 3
        );
        if (slotTaken.trim()) {
          const newPlayer = { ...state.picks[openSlot], ...data };
          const resident = state.picks.find((x) => x.slot === yourSlot);
          const {
            slot: rSlot,
            IsCaptain: rC,
            IsViceCaptain: rVC,
            multiplier: rM,
          } = resident;
          const {
            slot: nSlot,
            IsCaptain: nC,
            IsViceCaptain: nVC,
            multiplier: nM,
          } = newPlayer;
          const superRes = {
            ...resident,
            slot: nSlot,
            IsCaptain: nC,
            IsViceCaptain: nVC,
            multiplier: nM,
          };
          const superPlayer = {
            ...newPlayer,
            slot: rSlot,
            IsCaptain: rC,
            IsViceCaptain: rVC,
            multiplier: rM,
          };
          return {
            ...state,
            transfersIn: state.transfersIn.map((x) =>
              x._id === resident._id ? superRes : x
            ),
            transfersOut: state.transfersOut.filter((x) => x._id !== data._id),
            picks: state.picks.map((x, idx) =>
              idx === openSlot
                ? (x = superRes)
                : idx === yourSlotIndex
                ? (x = superPlayer)
                : x
            ),
            MID: state.MID + 1,
          };
        } else {
          const slotIndex = state.transfersOut.findIndex(
            (x) => x._id === data._id
          );
          const newPlayer = { ...state.picks[yourSlotIndex], ...data };
          return {
            ...state,
            transfersIn: state.transfersIn,
            transfersOut: state.transfersOut.filter(
              (x, idx) => idx !== slotIndex
            ),
            picks: state.picks.map((x, idx) =>
              idx === yourSlotIndex ? (x = newPlayer) : x
            ),
            MID: state.MID + 1,
          };
        }
      } else {
        const openSlot = state.picks.findIndex(
          (x) => x._id === "" && x.playerPosition === 3
        );
        const newPlayer = { ...state.picks[openSlot], ...data };
        return {
          ...state,
          transfersIn: [...state.transfersIn, newPlayer],
          transfersOut: state.transfersOut,
          picks: state.picks.map((x, idx) =>
            idx === openSlot ? (x = newPlayer) : x
          ),
          MID: state.MID + 1,
        };
      }
    }

    if (action.type === "MID_ADD" && state.MID === 5) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of midfielders`,
      };
    }
    if (action.type === "FWD_ADD" && state.FWD < 3) {
      const { data } = action;
      /*const openSlot = state.picks.findIndex(
        (x) => x._id === "" && x.playerPosition === 4
      );
      const newPlayer = { ...state.picks[openSlot], ...data };
      return {
        ...state,
        transfersIn: [...state.transfersIn, newPlayer],
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        FWD: state.FWD + 1,
      };*/
      if (ids.includes(data._id)) {
        const yourSlot = state.originalPicks.find(
          (x) => x._id === data._id
        ).slot;
        const slotTaken = state.picks.find((x) => x.slot === yourSlot)?._id;
        const yourSlotIndex = state.picks.findIndex((x) => x.slot === yourSlot);
        const openSlot = state.picks.findIndex(
          (x) => x._id === "" && x.playerPosition === 4
        );
        if (slotTaken.trim()) {
          const newPlayer = { ...state.picks[openSlot], ...data };
          const resident = state.picks.find((x) => x.slot === yourSlot);
          const {
            slot: rSlot,
            IsCaptain: rC,
            IsViceCaptain: rVC,
            multiplier: rM,
          } = resident;
          const {
            slot: nSlot,
            IsCaptain: nC,
            IsViceCaptain: nVC,
            multiplier: nM,
          } = newPlayer;
          const superRes = {
            ...resident,
            slot: nSlot,
            IsCaptain: nC,
            IsViceCaptain: nVC,
            multiplier: nM,
          };
          const superPlayer = {
            ...newPlayer,
            slot: rSlot,
            IsCaptain: rC,
            IsViceCaptain: rVC,
            multiplier: rM,
          };
          return {
            ...state,
            transfersIn: state.transfersIn.map((x) =>
              x._id === resident._id ? superRes : x
            ),
            transfersOut: state.transfersOut.filter((x) => x._id !== data._id),
            picks: state.picks.map((x, idx) =>
              idx === openSlot
                ? (x = superRes)
                : idx === yourSlotIndex
                ? (x = superPlayer)
                : x
            ),
            FWD: state.FWD + 1,
          };
        } else {
          const slotIndex = state.transfersOut.findIndex(
            (x) => x._id === data._id
          );
          const newPlayer = { ...state.picks[yourSlotIndex], ...data };
          return {
            ...state,
            transfersIn: state.transfersIn,
            transfersOut: state.transfersOut.filter(
              (x, idx) => idx !== slotIndex
            ),
            picks: state.picks.map((x, idx) =>
              idx === yourSlotIndex ? (x = newPlayer) : x
            ),
            FWD: state.FWD + 1,
          };
        }
      } else {
        const openSlot = state.picks.findIndex(
          (x) => x._id === "" && x.playerPosition === 4
        );
        const newPlayer = { ...state.picks[openSlot], ...data };
        return {
          ...state,
          transfersIn: [...state.transfersIn, newPlayer],
          transfersOut: state.transfersOut,
          picks: state.picks.map((x, idx) =>
            idx === openSlot ? (x = newPlayer) : x
          ),
          FWD: state.FWD + 1,
        };
      }
    }
    if (action.type === "FWD_ADD" && state.FWD === 3) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of forwards`,
      };
    }

    if (action.type === "GKP_REMOVE") {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) => x._id === data._id && x.playerPosition === 1
      );
      const newData = { nowCost: "", playerTeam: "", _id: "" };
      const newPlayer = { ...state.picks[openSlot], ...newData };
      const slotIndex = state.transfersIn.findIndex((x) => x._id === data._id);
      return {
        ...state,
        transfersIn: ids.includes(data._id)
          ? state.transfersIn
          : state.transfersIn.splice(slotIndex, 1),
        transfersOut: ids.includes(data._id)
          ? [...state.transfersOut, data]
          : state.transfersOut,
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        GKP: state.GKP - 1,
      };
    }

    if (action.type === "DEF_REMOVE") {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) => x._id === data._id && x.playerPosition === 2
      );
      const newData = { nowCost: "", playerTeam: "", _id: "" };
      const newPlayer = { ...state.picks[openSlot], ...newData };
      const slotIndex = state.transfersIn.findIndex((x) => x._id === data._id);
      return {
        ...state,
        transfersIn: ids.includes(data._id)
          ? state.transfersIn
          : state.transfersIn.splice(slotIndex, 1),
        transfersOut: ids.includes(data._id)
          ? [...state.transfersOut, data]
          : state.transfersOut,
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        DEF: state.DEF - 1,
      };
    }

    if (action.type === "MID_REMOVE") {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) => x._id === data._id && x.playerPosition === 3
      );
      const newData = { nowCost: "", playerTeam: "", _id: "" };
      const newPlayer = { ...state.picks[openSlot], ...newData };
      const slotIndex = state.transfersIn.findIndex((x) => x._id === data._id);
      return {
        ...state,
        transfersIn: ids.includes(data._id)
          ? state.transfersIn
          : state.transfersIn.splice(slotIndex, 1),
        transfersOut: ids.includes(data._id)
          ? [...state.transfersOut, data]
          : state.transfersOut,
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        MID: state.MID - 1,
      };
    }

    if (action.type === "FWD_REMOVE") {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) => x._id === data._id && x.playerPosition === 4
      );
      const newData = { nowCost: "", playerTeam: "", _id: "" };
      const newPlayer = { ...state.picks[openSlot], ...newData };
      const slotIndex = state.transfersIn.findIndex((x) => x._id === data._id);
      return {
        ...state,
        transfersIn: ids.includes(data._id)
          ? state.transfersIn
          : state.transfersIn.splice(slotIndex, 1),
        transfersOut: ids.includes(data._id)
          ? [...state.transfersOut, data]
          : state.transfersOut,
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        FWD: state.FWD - 1,
      };
    }

    if (action.type === "RESET") {
      return {
        GKP: 2,
        DEF: 5,
        MID: 5,
        FWD: 3,
        transfersIn: [],
        transfersOut: [],
        errorMsg: "",
      };
    }
  };
  const [state, dispatch] = useReducer(reducer, {
    GKP: 0,
    DEF: 0,
    MID: 0,
    FWD: 0,
    picks: [],
    originalPicks: [],
    errorMsg: "",
    transfersOut: [],
    transfersIn: [],
    oldTransfersOut: [],
    oldTransfersIn: [],
  });
  const { GKP, DEF, MID, FWD, picks, errorMsg, transfersOut, transfersIn } =
    state;
    const { playersPlatform, picksPlatform } = platform
  const totalPlayers = GKP + DEF + MID + FWD;
  const teamValue = picks?.reduce((x, y) => x + +y.nowCost, 0);
  const itb = 100 - teamValue;
  const outMap = new Map(transfersOut.map(x => [x.slot, x])) || {}

  const gotoPlayers = (data) => {
    setPlatform((prev) => ({picksPlatform: false, playersPlatform: true}));
    setTransferView(`position_${data}`);
    /*playersRef.current.scrollIntoView({ behavior: "smooth" });*/
  };

  const gotoPicks = () => {
    setPlatform((prev) => ({picksPlatform: true, playersPlatform: false}));
  }
  
  const gotoPlayersList = () => {
    setPlatform((prev) => ({picksPlatform: false, playersPlatform: true}));
  }

  const goUp = () => upRef.current.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    dispatch({
      type: "INITIAL_PICKS",
      payload: {
        ...state,
        picks: data?.picks,
        originalPicks: data?.picks,
        GKP: 2,
        DEF: 5,
        MID: 5,
        FWD: 3,
        errorMsg: "",
        transfersOut: [],
        transfersIn: [],
      },
    });
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  },[])

  const addPlayer = (data) => {
    const { shortPos, ...rest } = data;
    dispatch({ type: `${shortPos}_ADD`, data: rest });
  };

  const removePlayer = (data) => {
    const { shortPos, ...rest } = data;
    dispatch({ type: `${shortPos}_REMOVE`, data: rest });
  };

  const reset = () => {
    dispatch({
      type: "INITIAL_PICKS",
      payload: {
        ...state,
        picks: data?.picks,
        errorMsg: "",
        transfersOut: [],
        transfersIn: [],
        GKP: 2,
        DEF: 5,
        MID: 5,
        FWD: 3,
      },
    });
  };

  const auto = () => {
    const idGKP = picks.filter((x) => x.playerPosition === 1).map((x) => x._id);
    const idDEF = picks.filter((x) => x.playerPosition === 2).map((x) => x._id);
    const idMID = picks.filter((x) => x.playerPosition === 3).map((x) => x._id);
    const idFWD = picks.filter((x) => x.playerPosition === 4).map((x) => x._id);

    const autoPickFunc = (picks, max, available, pos, posId) => {
      const autoPlay = players?.updatedPlayers?.filter(
          (player) =>
            player.playerPosition === posId && !picks.includes(player._id)
        )
        .slice(0, max - available);
      autoPlay.map((playerPos) => {
        addPlayer({
          _id: playerPos._id,
          playerPosition: playerPos.playerPosition,
          playerTeam: playerPos.playerTeam,
          nowCost: playerPos.nowCost,
          shortPos: pos,
        });
      });
    };

    autoPickFunc(idGKP, 2, GKP, "GKP", 1);
    autoPickFunc(idDEF, 5, DEF, "DEF", 2);
    autoPickFunc(idMID, 5, MID, "MID", 3);
    autoPickFunc(idFWD, 3, FWD, "FWD", 4);
  };

  return (
    <>
      <div ref={upRef} className="main">
        {(picksPlatform || isSmallScreen === false) && <PicksPlatform
          picksPlatform={picksPlatform}
          scrollToPlayers={gotoPlayers}
          isLoading={isLoading}
          id={data}
          teamValue={teamValue}
          reset={reset}
          auto={auto}
          itb={itb}
          players={players?.updatedPlayers}
          teams={teams}
          totalPlayers={totalPlayers}
          picks={picks}
          removePlayer={removePlayer}
          restore={addPlayer}
          transfersOut={transfersOut}
          transfersIn={transfersIn}
          outMap={outMap}
          gotoPlayersList={gotoPlayersList}
          isSmallScreen={isSmallScreen}
        />}
        <div className="hide-platform">
          {(playersPlatform || isSmallScreen === false) && <Players
            GKP={GKP}
            DEF={DEF}
            MID={MID}
            FWD={FWD}
            goUp={goUp}
            transferView={transferView}
            errorMsg={errorMsg}
            picks={picks}
            removePlayer={removePlayer}
            addPlayer={addPlayer}
            gotoPicks={gotoPicks}
            isSmallScreen={isSmallScreen}
          />}
        </div>
      </div>

      <Container className="main">
        <FixtureList mdParam={"next"} />
      </Container>
    </>
  );
};

export default Transfers;
