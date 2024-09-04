import { useReducer, useEffect } from "react";
import LeagueDetails from "../components/LeagueDetails";
import ManagerPicks from "../components/ManagerPicks";
import FixtureList from "../components/FixtureList";
import { Container } from "react-bootstrap";
import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice";
import { useGetPicksQuery } from "../slices/picksSlice";

const PickTeam = () => {
  const { data: managerInfo } = useGetManagerInfoQuery();
  const { data: managerPicks } = useGetPicksQuery();

  const reducer = (state, action) => {
    if(action.type === 'INITIAL_PICKS') {
      return action.payload
    }
    if(action.type === 'SWITCH_CAP') {
      const { data } = action
      const exCap = state.picks.find(x => x.multiplier > 1)
      const player = {...data, multiplier: exCap.multiplier, 
        IsCaptain: exCap.IsCaptain, IsViceCaptain: exCap.IsViceCaptain}
      const exCapObj = {...exCap, multiplier: data.multiplier, IsCaptain: 
        data.IsCaptain, IsViceCaptain: data.IsViceCaptain}
      return {
        ...state,
        picks: state.picks.map(x => x._id === data._id ? x = player : x._id === exCap._id ? x = exCapObj : x)
      }
    }
    if(action.type === 'SWITCH_VICE') {
      const { data } = action
      const exCap = state.picks.find(x => x.IsViceCaptain === true)
      const player = {...data, multiplier: exCap.multiplier, 
        IsCaptain: exCap.IsCaptain, IsViceCaptain: exCap.IsViceCaptain}
      const exCapObj = {...exCap, multiplier: data.multiplier, IsCaptain: 
        data.IsCaptain, IsViceCaptain: data.IsViceCaptain}
      return {
        ...state,
        picks: state.picks.map(x => x._id === data._id ? x = player : x._id === exCap._id ? x = exCapObj : x)
      }
    }/*
    if(action.type === 'SET_SWITCH') {
      const { data } = action
      if(data.multiplier > 0) {
        const okayed = state.picks.filter(x => x.multiplier === 0).map(x => x.slot)
        const blocked = state.picks.filter(x => x.multiplier > 0 && x.slot !== data.slot).map(x => x.slot)
      return {
        ...state,
        switcher: data,
        okayed: okayed,
        blocked: blocked
      }}
    }*/
      if(action.type === 'GKP_SET_SWITCH') {
        const { data } = action
          const okayed = state.picks.filter(x => x._id !== data._id && x.playerPosition === '669a41e50f8891d8e0b4eb2a').map(x => x.slot)
          const blocked = state.picks.filter(x => x.playerPosition !== '669a41e50f8891d8e0b4eb2a').map(x => x.slot)
        return {
          ...state,
          switcher: data,
          okayed: okayed,
          blocked: blocked
        }
      }
      if(action.type === 'DEF_SET_SWITCH') {
        const { data } = action
        /*  const okayed = state.picks.filter(x => x._id !== data._id && x.playerPosition === '669a41e50f8891d8e0b4eb2a').map(x => x.slot)
          const blocked = state.picks.filter(x => x.playerPosition !== '669a41e50f8891d8e0b4eb2a').map(x => x.slot)
        return {
          ...state,
          switcher: data,
          okayed: okayed,
          blocked: blocked
        }*/
       if(data.multiplier === 0) {
        console.log('0')
       } else {
        console.log('1')
       }

      }

      if(action.type === 'MID_SET_SWITCH') {
        const { data } = action
        /*  const okayed = state.picks.filter(x => x._id !== data._id && x.playerPosition === '669a41e50f8891d8e0b4eb2a').map(x => x.slot)
          const blocked = state.picks.filter(x => x.playerPosition !== '669a41e50f8891d8e0b4eb2a').map(x => x.slot)
        return {
          ...state,
          switcher: data,
          okayed: okayed,
          blocked: blocked
        }*/
       if(data.multiplier === 0) {
        console.log('0')
       } else {
        console.log('1')
       }

      }

      if(action.type === 'FWD_SET_SWITCH') {
        const { data } = action
        /*  const okayed = state.picks.filter(x => x._id !== data._id && x.playerPosition === '669a41e50f8891d8e0b4eb2a').map(x => x.slot)
          const blocked = state.picks.filter(x => x.playerPosition !== '669a41e50f8891d8e0b4eb2a').map(x => x.slot)
        return {
          ...state,
          switcher: data,
          okayed: okayed,
          blocked: blocked
        }*/
       if(data.multiplier === 0) {
         if(state.DEF === 3) {
          /*const okayed = state.picks.filter(x => x._id !== data._id && x.multiplier > 0 && 
            x.playerPosition !== '669a41e50f8891d8e0b4eb2a' && x.playerPosition !== "669a4831e181cb2ed40c240f")
            .map(x => x.slot)
          const blocked = state.picks.filter  */
          console.log('0')
         }
       } else {
        //const okayed = state.picks.filter(x => x._id !== data._id)
        console.log('1')
       }

      }
      if(action.type === 'SWAP_PLAYER') {
        const { data } = action
        const { multiplier, IsCaptain, IsViceCaptain, slot }= state.switcher
      const player = {...data, multiplier, IsCaptain, IsViceCaptain, slot}
      const newSwitcher = {...state.switcher, multiplier: data.multiplier, IsCaptain: 
        data.IsCaptain, IsViceCaptain: data.IsViceCaptain, slot: data.slot}
      return {
        ...state,
        switcher: {},
          okayed: [],
          blocked: [],
        picks: state.picks.map(x => x._id === data._id ? x = player : x._id === state.switcher._id ? x = newSwitcher : x)
      }
        
      }
    if(action.type === 'CANCEL') {
      return {
        ...state,
        switcher: {},
        okayed: [],
        blocked: []
      }
    }
  }

  const [ state, dispatch ] = useReducer(reducer, { GKP:0, DEF: 0, MID: 0, FWD: 0, picks: [], switcher: {}, blocked: [], okayed: []})
  const {picks, switcher, blocked, okayed} = state

  useEffect(() => {
    const goalkeepers = managerPicks?.picks?.filter(
      (pick) =>
        pick?.playerPosition === "669a41e50f8891d8e0b4eb2a" &&
        pick?.multiplier > 0
    ).length;
    const defenders = managerPicks?.picks?.filter(
      (pick) =>
        pick?.playerPosition === "669a4831e181cb2ed40c240f" &&
        pick?.multiplier > 0
    ).length;
    const midfielders = managerPicks?.picks?.filter(
      (pick) =>
        pick?.playerPosition === "669a4846e181cb2ed40c2413" &&
        pick?.multiplier > 0
    ).length;
    const forwards = managerPicks?.picks?.filter(
      (pick) =>
        pick?.playerPosition === "669a485de181cb2ed40c2417" &&
        pick?.multiplier > 0
    ).length; 
    dispatch({type: 'INITIAL_PICKS', 
      payload: {
        ...state,
        picks: managerPicks?.picks,
        GKP: goalkeepers,
        DEF: defenders,
        MID: midfielders,
        FWD: forwards
      }
    })
  },[managerPicks])

  const switchPlayer = (data) => {
    const { shortPos, ...rest} = data
    if(Object.keys(switcher).length === 0) {
      dispatch({type: `${shortPos}_SET_SWITCH`, data:rest})
    }
    if(data._id === switcher._id) {
      dispatch({type: `CANCEL`})
    }
    if(Object.keys(switcher).length > 0 && (data._id !== switcher._id)) {
      dispatch({type: `SWAP_PLAYER`, data: rest})
    }
  }
  const switchCaptain = (data) => {
    dispatch({type: `SWITCH_CAP`, data})
  }
  const switchVice = (data) => {
    dispatch({type: `SWITCH_VICE`, data})
  }
  const inform = (data) => {
    console.log('view info')
  }
  return (
    <>
      <div className="main">
        <ManagerPicks
        blocked={blocked}
        okayed={okayed}
        switcher={switcher}
         picks={picks} switchCaptain={switchCaptain} switchVice={switchVice} inform={inform} switchPlayer={switchPlayer} teamName={managerInfo?.teamName} />
        <LeagueDetails privateLeagues={managerInfo?.privateLeagues}
        teamLeagues={managerInfo?.teamLeagues}
        overallLeagues={managerInfo?.overallLeagues}
        teamName={managerInfo?.teamName}
        teamValue={managerPicks?.teamValue}
        bank={managerPicks?.bank}
         />
      </div>
      <Container>
        <FixtureList />
      </Container>
    </>
  );
};

export default PickTeam;
