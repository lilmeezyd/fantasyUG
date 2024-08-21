import { useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import {
  useGetOverallLeaguesQuery,
  useGetTeamLeaguesQuery,
} from "../slices/leagueApiSlice";
import {useGetQuery} from "../slices/teamApiSlice"
import { Button } from "react-bootstrap";
const PicksPlatform = () => {
  const [ teamName, setTeamName ] = useState('')
  const [picks, setPicks] = useState([{ _id: '',
    playerPosition: '669a41e50f8891d8e0b4eb2a',
    playerTeam: '',
    multiplier: 1,
    nowCost: '',
    IsCaptain: false,
    IsViceCaptain: true,
    slot: 1   
}, { _id: '',
  playerPosition: '669a41e50f8891d8e0b4eb2a',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 12   
}, { _id: '',
  playerPosition: '669a4831e181cb2ed40c240f',
  playerTeam: '',
  multiplier: 2,
  nowCost: '',
  IsCaptain: true,
  IsViceCaptain: false,
  slot: 2   
}, { _id: '',
  playerPosition: '669a4831e181cb2ed40c240f',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 3   
}, { _id: '',
  playerPosition: '669a4831e181cb2ed40c240f',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 4   
}, { _id: '',
  playerPosition: '669a4831e181cb2ed40c240f',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 5   
}, { _id: '',
  playerPosition: '669a4831e181cb2ed40c240f',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 13  
}, { _id: '',
  playerPosition: '669a4846e181cb2ed40c2413',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 6  
}, { _id: '',
  playerPosition: '669a4846e181cb2ed40c2413',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 7   
}, { _id: '',
  playerPosition: '669a4846e181cb2ed40c2413',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 8   
}, { _id: '',
  playerPosition: '669a4846e181cb2ed40c2413',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 9   
}, { _id: '',
  playerPosition: '669a4846e181cb2ed40c2413',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 14   
}, { _id: '',
  playerPosition: '669a485de181cb2ed40c2417',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 10   
}, { _id: '',
  playerPosition: '669a485de181cb2ed40c2417',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 11   
}, { _id: '',
  playerPosition:'669a485de181cb2ed40c2417',
  playerTeam: '',
  multiplier: 1,
  nowCost: '',
  IsCaptain: false,
  IsViceCaptain: false,
  slot: 15   
}]);

const goalkeepers = picks.filter(pick => pick.playerPosition === '669a41e50f8891d8e0b4eb2a')
const defenders = picks.filter(pick => pick.playerPosition === '669a4831e181cb2ed40c240f')
const midfielders = picks.filter(pick => pick.playerPosition === '669a4846e181cb2ed40c2413')
const forwards  = picks.filter(pick => pick.playerPosition === '669a485de181cb2ed40c2417')

  const { data: teamLeagues } = useGetTeamLeaguesQuery()
  const {data: teams} = useGetQuery()

  const onSubmit = () => {}
  const disableButton = () => {}
  const selectLeague = (e) => {
    console.log(e.target.value)
  }
  const onChange = (e) => {
    setTeamName(e.target.value)
  }
  const handleShowModal = () => {}

  return (
    <div>
      <div className="transfer-data p-2">
        <div className="transfer-item p-2">
          <div>Selected</div>
          <div>15/15</div>
        </div>
        <div className="transfer-item p-2">
          <div>ITB</div>
          <div>100.0</div>
        </div>
        <div className="transfer-item p-2">
          <div>TC</div>
          <div>-4</div>
        </div>
        <div className="transfer-item p-2">
          <div>FTs</div>
          <div>3</div>
        </div>
      </div>
      <div className="trans-reset p-2">
        <Button style={{ color: "aquamarine" }} className="btn-dark">
          Auto Pick
        </Button>
        <Button style={{ color: "aquamarine" }} className="btn-dark">
          Reset
        </Button>
      </div>
      <div className="no-picks-team">
        <div className="default-player">
          {goalkeepers.map(x => <div key={x.slot} className="squad-player">
            <div className="element">
            <button onClick={handleShowModal} className="player-btn">
              {x._id === '' ? <div className="p-holder">GKP</div> : <>GoalKeeper</>}
            </button>
            </div>
          </div>)}
        </div>
        <div className="default-player">
        {defenders.map(x => <div key={x.slot} className="squad-player">
            <div className="element">
            <button onClick={handleShowModal} className="player-btn">
              {x._id === '' ? <div className="p-holder">DEF</div> : <>Defender</>}
            </button>
            </div>
          </div>)}
        </div>
        <div className="default-player">
        {midfielders.map(x => <div key={x.slot} className="squad-player">
            <div className="element">
            <button onClick={handleShowModal} className="player-btn">
              {x._id === '' ? <div className="p-holder">MID</div> : <>Midfielder</>}
            </button>
            </div>
          </div>)}
        </div>
        <div className="default-player">
        {forwards.map(x => <div key={x.slot} className="squad-player">
            <div className="element">
            <button onClick={handleShowModal} className="player-btn">
              {x._id === '' ? <div className="p-holder">FWD</div> : <>Forward</>}
            </button>
            </div>
          </div>)}
        </div>
      </div>

      <section className="form">
                    <form onSubmit={onSubmit}>
                        <div className='team-name-1 py-3'>
                            <div className="form-group fav-team">
                                <label className="py-1" htmlFor="teamName">Team Name</label>
                                <input
                                    className='form-control'
                                    onChange={onChange}
                                    value={teamName}
                                    id='teamName'
                                    name='teamName'
                                    placeholder='Team Name'
                                    type="text" />
                            </div>
                            <div className='name-warning py-1'>*Team name should not be more than 20 characters</div>
                        </div>
                        <div className='team-name-1 py-3'>
                            <div className="form-group fav-team">
                                <label  className="py-1" htmlFor="team">Favorite Team</label>
                                <select className="form-control" name="team" id="team" onChange={selectLeague}>
                                    {teamLeagues?.map(league => (
                                        <option value={league._id} key={league._id}>
                                            {league?.team?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='name-warning py-1'>*Select favorite team</div>
                        </div>
                        <div className="form-group py-3">
                            <Button disabled={disableButton()} className="btn-success form-control">Save</Button>
                        </div>
                    </form>
                </section>
    </div>
  );
};

export default PicksPlatform;
