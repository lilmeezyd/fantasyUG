import { useReducer } from "react";
import Players from "../components/Players";
import PicksPlatform from "../components/PicksPlatform";
const CreateTeam = () => {
  const initialState = [
    {
      _id: "",
      playerPosition: "669a41e50f8891d8e0b4eb2a",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: true,
      slot: 1,
    },
    {
      _id: "",
      playerPosition: "669a41e50f8891d8e0b4eb2a",
      playerTeam: "",
      multiplier: 0,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 12,
    },
    {
      _id: "",
      playerPosition: "669a4831e181cb2ed40c240f",
      playerTeam: "",
      multiplier: 2,
      nowCost: "",
      IsCaptain: true,
      IsViceCaptain: false,
      slot: 2,
    },
    {
      _id: "",
      playerPosition: "669a4831e181cb2ed40c240f",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 3,
    },
    {
      _id: "",
      playerPosition: "669a4831e181cb2ed40c240f",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 4,
    },
    {
      _id: "",
      playerPosition: "669a4831e181cb2ed40c240f",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 5,
    },
    {
      _id: "",
      playerPosition: "669a4831e181cb2ed40c240f",
      playerTeam: "",
      multiplier: 0,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 13,
    },
    {
      _id: "",
      playerPosition: "669a4846e181cb2ed40c2413",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 6,
    },
    {
      _id: "",
      playerPosition: "669a4846e181cb2ed40c2413",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 7,
    },
    {
      _id: "",
      playerPosition: "669a4846e181cb2ed40c2413",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 8,
    },
    {
      _id: "",
      playerPosition: "669a4846e181cb2ed40c2413",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 9,
    },
    {
      _id: "",
      playerPosition: "669a4846e181cb2ed40c2413",
      playerTeam: "",
      multiplier: 0,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 14,
    },
    {
      _id: "",
      playerPosition: "669a485de181cb2ed40c2417",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 10,
    },
    {
      _id: "",
      playerPosition: "669a485de181cb2ed40c2417",
      playerTeam: "",
      multiplier: 1,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 11,
    },
    {
      _id: "",
      playerPosition: "669a485de181cb2ed40c2417",
      playerTeam: "",
      multiplier: 0,
      nowCost: "",
      IsCaptain: false,
      IsViceCaptain: false,
      slot: 15,
    },
  ]
  const reducer = (state, action) => {
    if(action.type === "GKP_ADD" && state.GKP < 2) {
      const { data } = action
      const openSlot = state.picks.findIndex(x => x._id === '' && x.playerPosition === '669a41e50f8891d8e0b4eb2a')
      const newPlayer = {...state.picks[openSlot], ...data}
      return {
        ...state,
        picks: state.picks.map((x, idx) => idx === openSlot ? x = newPlayer : x),
        GKP: state.GKP+1
      }
    }
    if(action.type === "GKP_ADD" && state.GKP === 2) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of goalkeepers`
      }
    }

    if(action.type === "DEF_ADD" && state.DEF < 5) {
      const { data } = action
      const openSlot = state.picks.findIndex(x => x._id === '' && x.playerPosition === '669a4831e181cb2ed40c240f')
      const newPlayer = {...state.picks[openSlot], ...data}
      return {
        ...state,
        picks: state.picks.map((x, idx) => idx === openSlot ? x = newPlayer : x),
        DEF: state.DEF+1
      }
    }

    if(action.type === "DEF_ADD" && state.DEF === 5) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of defenders`
      }
    }

    if(action.type === "MID_ADD" && state.MID < 5) {
      const { data } = action
      const openSlot = state.picks.findIndex(x => x._id === '' && x.playerPosition === '669a4846e181cb2ed40c2413')
      const newPlayer = {...state.picks[openSlot], ...data}
      return {
        ...state,
        picks: state.picks.map((x, idx) => idx === openSlot ? x = newPlayer : x),
        MID: state.MID+1
      }
    }

    if(action.type === "MID_ADD" && state.MID === 5) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of midfielders`
      }
    }
    if(action.type === "FWD_ADD" && state.FWD < 3) {
      const { data } = action
      const openSlot = state.picks.findIndex(x => x._id === '' && x.playerPosition === '669a485de181cb2ed40c2417')
      const newPlayer = {...state.picks[openSlot], ...data}
      return {
        ...state,
        picks: state.picks.map((x, idx) => idx === openSlot ? x = newPlayer : x),
        FWD: state.FWD+1
      }
    }
    if(action.type === "FWD_ADD" && state.FWD === 3) {
      return {
        ...state,
        errorMsg: `You already have the maximum number of forwards`
      }
    }

    if(action.type === "GKP_REMOVE") {
      const { data } = action
      const openSlot = state.picks.findIndex(x => x._id === data._id && x.playerPosition === '669a41e50f8891d8e0b4eb2a')
      const newData = {nowCost: '', playerTeam: '', _id: ''}
      const newPlayer = {...state.picks[openSlot], ...newData}
      return {
        ...state,
        picks: state.picks.map((x, idx) => idx === openSlot ? x = newPlayer : x),
        GKP: state.GKP-1
      }
    }

    if(action.type === "DEF_REMOVE") {
      const { data } = action
      const openSlot = state.picks.findIndex(x => x._id === data._id && x.playerPosition === '669a4831e181cb2ed40c240f')
      const newData = {nowCost: '', playerTeam: '', _id: ''}
      const newPlayer = {...state.picks[openSlot], ...newData}
      return {
        ...state,
        picks: state.picks.map((x, idx) => idx === openSlot ? x = newPlayer : x),
        DEF: state.DEF-1
      }
    }

    if(action.type === "MID_REMOVE") {
      const { data } = action
      const openSlot = state.picks.findIndex(x => x._id === data._id && x.playerPosition === '669a4846e181cb2ed40c2413')
      const newData = {nowCost: '', playerTeam: '', _id: ''}
      const newPlayer = {...state.picks[openSlot], ...newData}
      return {
        ...state,
        picks: state.picks.map((x, idx) => idx === openSlot ? x = newPlayer : x),
        MID: state.MID-1
      }
    }

    if(action.type === "FWD_REMOVE") {
      const { data } = action
      const openSlot = state.picks.findIndex(x => x._id === data._id && x.playerPosition === '669a485de181cb2ed40c2417')
      const newData = {nowCost: '', playerTeam: '', _id: ''}
      const newPlayer = {...state.picks[openSlot], ...newData}
      return {
        ...state,
        picks: state.picks.map((x, idx) => idx === openSlot ? x = newPlayer : x),
        FWD: state.FWD-1
      }
    }

    if(action.type === 'RESET') {
      return {
        GKP:0, DEF: 0, MID: 0, FWD: 0, picks: initialState, errorMsg: ''
      }
    }
  }
  const [state, dispatch] = useReducer(reducer, {GKP:0, DEF: 0, MID: 0, FWD: 0, picks: initialState, errorMsg: ''})
  const { GKP, DEF, MID, FWD, picks, errorMsg } = state
  const totalPlayers = GKP+DEF+MID+FWD
  const teamValue = picks?.reduce((x,y) => x+(+y.nowCost), 0)
  const itb = 100 - teamValue
  

  const addPlayer = (data) => {
    const { shortPos, ...rest} = data
    dispatch({type:`${shortPos}_ADD`, data:rest})

  }

  const removePlayer = (data) => {
    const { shortPos, ...rest} = data
    dispatch({type: `${shortPos}_REMOVE`, data:rest})
  }

  const reset = () => {
    dispatch({type: 'RESET'})
  }

  return (
    <div className="main">
      <PicksPlatform teamValue={teamValue} reset={reset} itb={itb} totalPlayers={totalPlayers} picks={picks} removePlayer={removePlayer} />
      <Players GKP={GKP} DEF={DEF} MID={MID} FWD={FWD} errorMsg={errorMsg} picks={picks} removePlayer={removePlayer} addPlayer={addPlayer} />
    </div>
  );
};

export default CreateTeam;
