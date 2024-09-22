import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useGetPlayersQuery } from "../../../slices/playerApiSlice";
import { useEditStatsMutation } from "../../../slices/fixtureApiSlice";


const EditStatsModal = (props) => {
  const { show, handleClose, fixture } = props;
  const [data, setData ] = useState({
    identifier: '', homeAway: '', player: '', value: ''
})

const { identifier, homeAway, player, value } = data
  const { data: players } = useGetPlayersQuery()
  const [ editStats ] = useEditStatsMutation()

  const onSubmit = async (e) => {
    e.preventDefault()
    const newValue = +value
    const stats = {
      identifier, homeAway, player, value: newValue
  }
  try {
    await editStats({id: fixture._id, ...stats}).unwrap()
  } catch (error) {
    console.log(error)
  }

  handleClose()
  }

  const onChange = async (e) => {
    setData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
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
              <select className="form-control" name="player" id="player" onChange={onChange}>
                <option value="">Select Player</option>

                {homeAway === "home" &&
                  players
                    .filter(
                      (x) => x.playerTeam.toString() === fixture?.teamHome?.toString()
                    )
                    .map((player) => (
                      <option key={player._id} value={player._id}>
                        {player.appName}
                      </option>
                    ))}

                {homeAway === "away" &&
                  players
                    .filter(
                      (x) => x.playerTeam.toString() === fixture?.teamAway?.toString()
                    )
                    .map((player) => (
                      <option key={player._id} value={player._id}>
                        {player.appName}
                      </option>
                    ))}
              </select>
            </div>
            <div className="form-group pb-2">
              <select className="form-control" name="value" id="value" onChange={onChange}>
                <option value="">Select Value</option>
                {[-3, -2,-1, 1,2,3].map((val, idx) => (
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
