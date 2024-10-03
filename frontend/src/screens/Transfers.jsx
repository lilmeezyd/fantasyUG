import { useEffect, useReducer } from "react";
import PicksPlatform from "../components/PicksPlatform";
import Players from "../components/Players";
import { useGetPicksQuery } from "../slices/picksSlice";
import { Spinner } from "react-bootstrap";
import FixtureList from "../components/FixtureList";

const Transfers = () => {
  const { data, isLoading } = useGetPicksQuery();
  const reducer = (state, action) => {
    if (action.type === "INITIAL_PICKS") {
      return action.payload;
    }
    if (action.type === "GKP_ADD" && state.GKP < 2) {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) => x._id === "" && x.playerPosition === "669a41e50f8891d8e0b4eb2a"
      );
      const newPlayer = { ...state.picks[openSlot], ...data };
      /*const ids = state.transfersOut.map(x => x._id)
      console.log(ids)
      console.log(data._id)
      const transfersIn = ids.includes(data._id) ? 'yes' : 'no'*/
      const slotIndex = state.transfersOut.findIndex(x => x._id === data._id)
     /* const transfersOut = ids.includes(data._id) ? state.transfersOut.splice(slotIndex,1) : state.transfersOut
      console.log(ids)
      console.log(transfersOut)
      console.log(transfersIn)*/
      return {
        ...state,
        transfersIn: state.transfersOut.map(x => x._id).includes(data._id) ? 'yes' : 'no',
        transfersOut: state.transfersOut.map(x => x._id).includes(data._id) ? state.transfersOut.splice(slotIndex,1) : state.transfersOut,
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        GKP: state.GKP + 1,
      };
    }
    if (action.type === "GKP_ADD" && state.GKP === 2) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of goalkeepers`,
      };
    }

    if (action.type === "DEF_ADD" && state.DEF < 5) {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) => x._id === "" && x.playerPosition === "669a4831e181cb2ed40c240f"
      );
      const newPlayer = { ...state.picks[openSlot], ...data };
      return {
        ...state,
        transfersIn: [...state.transfersIn, newPlayer],
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        DEF: state.DEF + 1,
      };
    }

    if (action.type === "DEF_ADD" && state.DEF === 5) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of defenders`,
      };
    }

    if (action.type === "MID_ADD" && state.MID < 5) {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) => x._id === "" && x.playerPosition === "669a4846e181cb2ed40c2413"
      );
      const newPlayer = { ...state.picks[openSlot], ...data };
      return {
        ...state,
        transfersIn: [...state.transfersIn, newPlayer],
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        MID: state.MID + 1,
      };
    }

    if (action.type === "MID_ADD" && state.MID === 5) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of midfielders`,
      };
    }
    if (action.type === "FWD_ADD" && state.FWD < 3) {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) => x._id === "" && x.playerPosition === "669a485de181cb2ed40c2417"
      );
      const newPlayer = { ...state.picks[openSlot], ...data };
      return {
        ...state,
        transfersIn: [...state.transfersIn, newPlayer],
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        FWD: state.FWD + 1,
      };
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
        (x) =>
          x._id === data._id && x.playerPosition === "669a41e50f8891d8e0b4eb2a"
      );
      const newData = { nowCost: "", playerTeam: "", _id: "" };
      const newPlayer = { ...state.picks[openSlot], ...newData };
      return {
        ...state,
        transfersOut: [...state.transfersOut, data],
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        GKP: state.GKP - 1,
      };
    }

    if (action.type === "DEF_REMOVE") {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) =>
          x._id === data._id && x.playerPosition === "669a4831e181cb2ed40c240f"
      );
      const newData = { nowCost: "", playerTeam: "", _id: "" };
      const newPlayer = { ...state.picks[openSlot], ...newData };
      return {
        ...state,
        transfersOut: [...state.transfersOut, data],
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        DEF: state.DEF - 1,
      };
    }

    if (action.type === "MID_REMOVE") {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) =>
          x._id === data._id && x.playerPosition === "669a4846e181cb2ed40c2413"
      );
      const newData = { nowCost: "", playerTeam: "", _id: "" };
      const newPlayer = { ...state.picks[openSlot], ...newData };
      return {
        ...state,
        transfersOut: [...state.transfersOut, data],
        picks: state.picks.map((x, idx) =>
          idx === openSlot ? (x = newPlayer) : x
        ),
        MID: state.MID - 1,
      };
    }

    if (action.type === "FWD_REMOVE") {
      const { data } = action;
      const openSlot = state.picks.findIndex(
        (x) =>
          x._id === data._id && x.playerPosition === "669a485de181cb2ed40c2417"
      );
      const newData = { nowCost: "", playerTeam: "", _id: "" };
      const newPlayer = { ...state.picks[openSlot], ...newData };
      return {
        ...state,
        transfersOut: [...state.transfersOut, data],
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
    errorMsg: "",
    transfersOut: [],
    transfersIn: [],
    oldTransfersOut: [],
    oldTransfersIn: []
  });
  const { GKP, DEF, MID, FWD, picks, errorMsg, transfersOut, transfersIn } =
    state;
  const totalPlayers = GKP + DEF + MID + FWD;
  const teamValue = picks?.reduce((x, y) => x + +y.nowCost, 0);
  const itb = 100 - teamValue;

  useEffect(() => {
    dispatch({
      type: "INITIAL_PICKS",
      payload: {
        ...state,
        picks: data?.picks,
        GKP: 2,
        DEF: 5,
        MID: 5,
        FWD: 3,
      },
    });
  }, [data]);

  const addPlayer = (data) => {
    console.log(data);
    const { shortPos, ...rest } = data;
    dispatch({ type: `${shortPos}_ADD`, data: rest });
  };

  const removePlayer = (data) => {
    console.log(data);
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

  return (
    <div className="main">
      <div>
        <PicksPlatform
          isLoading={isLoading}
          id={data}
          teamValue={teamValue}
          reset={reset}
          itb={itb}
          totalPlayers={totalPlayers}
          picks={picks}
          removePlayer={removePlayer}
        />
        <FixtureList mdParam={"next"} />
      </div>
      <Players
        GKP={GKP}
        DEF={DEF}
        MID={MID}
        FWD={FWD}
        errorMsg={errorMsg}
        picks={picks}
        removePlayer={removePlayer}
        addPlayer={addPlayer}
      />
    </div>
  );
};

export default Transfers;
