import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useGetPlayersQuery } from "../../../slices/playerApiSlice";
import { useEditStatsMutation } from "../../../slices/fixtureApiSlice";


const EditStatsModal = (props) => {
  const { show, handleClose, fixture } = props;
  const [data, setData ] = useState({
    identifier: '', homeAway: '', player: [], value: ''
})

const { identifier, homeAway, player, value } = data
  const { data: players } = useGetPlayersQuery()
  const [ editStats, isLoading ] = useEditStatsMutation()

  const onSubmit = async (e) => {
    e.preventDefault()
    const newValue = +value
    const stats = {
      identifier, homeAway, player, value: newValue
  }
  console.log(stats)
  setData({identifier: '', homeAway: '', player: [], value: ''})
  
  try {
    await editStats({id: fixture._id, ...stats}).unwrap()
  } catch (error) {
    console.log(error)
  }

  handleClose()
  }

  const onChange = async (e) => {
    if(e.target.name === 'player') {
      const exists = player.includes(e.target.value)
      if(exists === true) {
        setData((prevState) => ({
          ...prevState,
          player: player.filter(x => x !== e.target.value) 
        }))
      } else {
        const newplayers = [...player, e.target.value]
        setData((prevState) => ({
          ...prevState,
          player: newplayers
        }))
      }
    } else {
      setData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value
      }))
    }
    
  }
  
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
        <Modal.Title>
          <div className="info-details">Edit Fixture Statistics</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <section className="form">
          <form onSubmit={onSubmit}>
            <div className="form-group py-2">
              <select className="form-control" name="identifier" id="identifier" onChange={onChange}>
                <option value="">Select Stat</option>
                {fixture?.stats
                  ?.map((x) => x.identifier)
                  ?.map((stat, idx) => (
                    <option key={idx} value={stat}>
                      {stat}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group pb-2">
              <select className="form-control" name="homeAway" id="homeAway" onChange={onChange}>
                <option value="">Select Home or Away</option>
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            </div>
            <div className="form-group pb-2">
              <div className="form-control">
                <div>Select Players</div>

                {homeAway === "home" &&
                  players?.filter(
                      (x) => x.playerTeam.toString() === fixture?.teamHome?.toString()
                    )?.map((player) => (
                      <div key={player._id}>
                        <input onChange={onChange} type="checkbox" value={player._id} name='player' id={player.appName} />
                        <label htmlFor={player.appName}>{player.appName}</label>
                      </div>
                    ))}

                {homeAway === "away" &&
                  players?.filter(
                      (x) => x.playerTeam.toString() === fixture?.teamAway?.toString()
                    )?.map((player) => (
                      <div key={player._id}>
                        <input onChange={onChange} type="checkbox" value={player._id} name='player' id={player.appName} />
                        <label htmlFor={player.appName}>{player.appName}</label>
                      </div>
                    ))}
              </div>
            </div>
            <div className="form-group pb-2">
              <select className="form-control" name="value" id="value" onChange={onChange}>
                <option value="">Select Value</option>
                {[-1, 1].map((val, idx) => (
                  <option key={idx} value={+val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <button className="btn btn-primary form-control">Submit</button>
            </div>
          </form>
        </section>
      </Modal.Body>
    </Modal>
  );
};

export default EditStatsModal;
