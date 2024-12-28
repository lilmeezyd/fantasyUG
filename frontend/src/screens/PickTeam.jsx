import {Spinner} from "react-bootstrap";
import { useReducer, useEffect } from "react";
import LeagueDetails from "../components/LeagueDetails";
import ManagerPicks from "../components/ManagerPicks";
import FixtureList from "../components/FixtureList";
import { Container } from "react-bootstrap";
import { useGetManagerInfoQuery } from "../slices/managerInfoApiSlice";
import { useGetPicksQuery } from "../slices/picksSlice";
 
const PickTeam = () => {
  const { data: managerInfo } = useGetManagerInfoQuery();
  const { data: managerPicks, isLoading } = useGetPicksQuery();
  console.log(managerInfo)
  /*console.log(isLoading)
  console.log(managerPicks)
  console.log(useGetPicksQuery())*/

  const reducer = (state, action) => {
    const ids = state?.picks?.map(x => x.slot)
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
    }
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
       if(data.multiplier === 0) {
        const okayB = state.picks.filter(x => x.multiplier === 0 && x.slot > 12).map(x => x.slot)
        if(state.FWD === 1) {
          const okayS = state.picks.filter(x => x.playerPosition !== "669a41e50f8891d8e0b4eb2a" && x.playerPosition !== "669a485de181cb2ed40c2417").map(x => x.slot)
          const okayed = [...okayB, ...okayS]
          const blocked = ids.filter(x => !okayed.includes(x))
          return {
            ...state,
            switcher: data,
            okayed: okayed,
            blocked: blocked
          }
        }
        const okayS = state.picks.filter(x => x.playerPosition !== "669a41e50f8891d8e0b4eb2a").map(x => x.slot)
        const okayed = [...okayB, ...okayS]
        const blocked = ids.filter(x => !okayed.includes(x))
        return {
          ...state,
          switcher: data,
          okayed: okayed,
          blocked: blocked
        }
       } else {
        if(state.DEF === 3) {
          const okayS = state.picks.filter(x => x.slot > 12 && x.playerPosition === "669a4831e181cb2ed40c240f").map(x => x.slot)
          const okayed = [...okayS]
          const blocked = ids.filter(x => !okayed.includes(x))
          return {
            ...state,
            switcher: data,
            okayed: okayed,
            blocked: blocked.filter(x => x !== data.slot)
          }
        }
        const okayS = state.picks.filter(x => x.slot > 12).map(x => x.slot)
        const okayed = [...okayS]
        const blocked = ids.filter(x => !okayed.includes(x))
        return {
          ...state,
          switcher: data,
          okayed: okayed,
          blocked: blocked.filter(x => x !== data.slot)
        }
       }

      }

      if(action.type === 'MID_SET_SWITCH') {
        const { data } = action
        if(data.multiplier === 0) {
          const okayB = state.picks.filter(x => x.multiplier === 0 && x.slot > 12).map(x => x.slot)
          if(state.FWD === 1) {
            const okayS = state.picks.filter(x => x.playerPosition !== "669a41e50f8891d8e0b4eb2a" && x.playerPosition !== "669a485de181cb2ed40c2417").map(x => x.slot)
            const okayed = [...okayB, ...okayS]
            const blocked = ids.filter(x => !okayed.includes(x))
            return {
              ...state,
              switcher: data,
              okayed: okayed,
              blocked: blocked
            }
          }
          
          if(state.DEF === 3) {
            const okayS = state.picks.filter(x => x.playerPosition !== "669a41e50f8891d8e0b4eb2a" && x.playerPosition !== "669a4831e181cb2ed40c240f").map(x => x.slot)
            const okayed = [...okayS, ...okayB]
            const blocked = ids.filter(x => !okayed.includes(x))
            return {
              ...state,
              switcher: data,
              okayed: okayed,
              blocked: blocked.filter(x => x !== data.slot)
            }
          }
          const okayS = state.picks.filter(x => x.playerPosition !== "669a41e50f8891d8e0b4eb2a").map(x => x.slot)
          const okayed = [...okayB, ...okayS]
          const blocked = ids.filter(x => !okayed.includes(x))
          return {
            ...state,
            switcher: data,
            okayed: okayed,
            blocked: blocked
          }
         } else {
          const okayS = state.picks.filter(x => x.slot > 12).map(x => x.slot)
          const okayed = [...okayS]
          const blocked = ids.filter(x => !okayed.includes(x))
          return {
            ...state,
            switcher: data,
            okayed: okayed,
            blocked: blocked.filter(x => x !== data.slot)
          }
         }

      }

      if(action.type === 'FWD_SET_SWITCH') {
        const { data } = action
        if(data.multiplier === 0) {
          const okayB = state.picks.filter(x => x.multiplier === 0 && x.slot > 12).map(x => x.slot)
          if(state.DEF === 3) {
            const okayS = state.picks.filter(x => x.playerPosition !== "669a41e50f8891d8e0b4eb2a" && x.playerPosition !== "669a4831e181cb2ed40c240f").map(x => x.slot)
            const okayed = [...okayS, ...okayB]
            const blocked = ids.filter(x => !okayed.includes(x))
            return {
              ...state,
              switcher: data,
              okayed: okayed,
              blocked: blocked.filter(x => x !== data.slot)
            }
          }
          const okayS = state.picks.filter(x => x.playerPosition !== "669a41e50f8891d8e0b4eb2a").map(x => x.slot)
          const okayed = [...okayB, ...okayS]
          const blocked = ids.filter(x => !okayed.includes(x))
          return {
            ...state,
            switcher: data,
            okayed: okayed,
            blocked: blocked
          }
         } else {
          const okayS = state.picks.filter(x => x.slot > 12).map(x => x.slot)
          
          if(state.FWD === 1) {
            const okayS = state.picks.filter(x => x.slot > 12 && x.playerPosition === "669a485de181cb2ed40c2417").map(x => x.slot)
            const okayed = [...okayS]
            const blocked = ids.filter(x => !okayed.includes(x))
            return {
              ...state,
              switcher: data,
              okayed: okayed,
              blocked: blocked.filter(x => x !== data.slot)
            }
          }
          
          const okayed = [...okayS]
          const blocked = ids.filter(x => !okayed.includes(x))
          return {
            ...state,
            switcher: data,
            okayed: okayed,
            blocked: blocked.filter(x => x !== data.slot)
          }
         }
      }
      if(action.type === 'SWAP_PLAYER') {
        const { data } = action
        const { multiplier, IsCaptain, IsViceCaptain, slot }= state.switcher
      const player = {...data, multiplier, IsCaptain, IsViceCaptain, slot}
      const newSwitcher = {...state.switcher, multiplier: data.multiplier, IsCaptain: 
        data.IsCaptain, IsViceCaptain: data.IsViceCaptain, slot: data.slot}
        let DEF = state.DEF, MID = state.MID, FWD = state.FWD
        if(data.shortPos !== 'GKP' && state.switcher.shortPos !== 'GKP') {
          /* Defender swap */
          if(state.switcher.shortPos === 'DEF') {
            if(state.switcher.multiplier === 0) {
              if(data.multiplier === 1) {
                if(data.shortPos === 'MID') {
                  MID-=1
                  DEF+=1
                }
                if(data.shortPos === 'FWD') {
                  FWD-=1
                  DEF+=1
                }
            }
            } else {
              if(data.shortPos === 'MID') {
                MID+=1
                DEF-=1
              }
              if(data.shortPos === 'FWD') {
                FWD+=1
                DEF-=1
              }
            }
            
          }

          /* Midfielder swap */
          if(state.switcher.shortPos === 'MID') {
            if(state.switcher.multiplier === 0) {
              if(data.multiplier === 1) {
                if(data.shortPos === 'DEF') {
                  MID+=1
                  DEF-=1
                }
                if(data.shortPos === 'FWD') {
                  FWD-=1
                  MID+=1
                }
            }
            } else {
              if(data.shortPos === 'DEF') {
                MID-=1
                DEF+=1
              }
              if(data.shortPos === 'FWD') {
                FWD+=1
                MID-=1
              }
            }
          }
          /* Forward swap */
          if(state.switcher.shortPos === 'FWD') {
            if(state.switcher.multiplier === 0) {
              if(data.multiplier === 1) {
                if(data.shortPos === 'DEF') {
                  FWD+=1
                  DEF-=1
                }
                if(data.shortPos === 'MID') {
                  FWD+=1
                  MID-=1
                }
            }
            } else {
              if(data.shortPos === 'MID') {
                MID+=1
                FWD-=1
              }
              if(data.shortPos === 'DEF') {
                FWD-=1
                DEF+=1
              }
            }
          } 

        }
      return {
        ...state,
        switcher: {},
          okayed: [],
          blocked: [],
          DEF,
          MID,
          FWD,
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
      dispatch({type: `${shortPos}_SET_SWITCH`, data})
    }
    if(data._id === switcher._id) {
      dispatch({type: `CANCEL`})
    }
    if(Object.keys(switcher).length > 0 && (data._id !== switcher._id)) {
      dispatch({type: `SWAP_PLAYER`, data})
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
  if(isLoading && managerPicks === undefined) {
    return (
      <div className="spinner"><Spinner /></div>
    )
  }
  return (
    <>
      <div className="main">
        <ManagerPicks
        isLoading={isLoading}
        id={managerPicks}
        blocked={blocked}
        okayed={okayed}
        switcher={switcher}
         picks={picks} switchCaptain={switchCaptain} switchVice={switchVice} inform={inform} switchPlayer={switchPlayer} teamName={managerInfo?.teamName} />
        <LeagueDetails
        firstName={managerInfo?.firstName}
        lastName={managerInfo?.lastName}
         privateLeagues={managerInfo?.privateLeagues}
        teamLeagues={managerInfo?.teamLeagues}
        overallLeagues={managerInfo?.overallLeagues}
        matchdayPoints={managerInfo?.matchdayPoints}
        overallPoints={managerInfo?.overallPoints}
        overallRank={managerInfo?.overallRank}
        teamName={managerInfo?.teamName}
        teamValue={managerPicks?.teamValue}
        bank={managerPicks?.bank}
         /> 
      </div>
      <Container className="main">
        <FixtureList mdParam={'next'} />
      </Container>
    </>
  );
};

export default PickTeam;
