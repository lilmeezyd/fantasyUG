import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useGetPlayersByFixtureQuery } from "../../../slices/playerApiSlice";
import { useEditStatsMutation } from "../../../slices/fixtureApiSlice";
import { toast } from "react-toastify";

const EditStatsModal = (props) => {
  const { show, handleClose, fixture } = props;
  const [data, setData] = useState({
    identifier: "",
    homeAway: "",
    player: [],
    value: "",
  });

  const { identifier, homeAway, player, value } = data;
  const { data: players = [] } = useGetPlayersByFixtureQuery(fixture?._id);
  const [editStats, isLoading] = useEditStatsMutation();
  console.log(players)

  const onSubmit = async (e) => {
    e.preventDefault();
    const newValue = +value;
    const stats = {
      identifier,
      homeAway,
      player,
      value: newValue,
    };
    setData({ identifier: "", homeAway: "", player: [], value: "" });

    try {
      const res = await editStats({ id: fixture._id, ...stats }).unwrap();
      toast.success(res?.message);
    } catch (error) {
      toast.error(error?.data?.details || error?.data?.message);
    }

    handleClose();
  };

  const onChange = async (e) => {
    if (e.target.name === "player") {
      const exists = player.includes(e.target.value);
      if (exists === true) {
        setData((prevState) => ({
          ...prevState,
          player: player.filter((x) => x !== e.target.value),
        }));
      } else {
        const newplayers = [...player, e.target.value];
        setData((prevState) => ({
          ...prevState,
          player: newplayers,
        }));
      }
    } else {
      setData((prevState) => ({
        ...prevState,
        [e.target.name]: e.target.value,
      }));
    }
  };

  return (
    <div className="w-min-[320px] fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Edit Fixture Statistics</h6>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="identifier">
              Statistic
            </label>
            <select
              name="identifier"
              id="identifier"
              onChange={onChange}
              className="w-full px-3 py-1 border rounded"
            >
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
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="homeAway">
              Select Team
            </label>
            <select
              name="homeAway"
              id="homeAway"
              onChange={onChange}
              className="w-full px-3 py-1 border rounded"
            >
              <option value="">Select Home or Away</option>
              <option value="home">Home</option>
              <option value="away">Away</option>
            </select>
          </div>
          <div className="py-2">
            <div>Select Players</div>

            {homeAway === "home" &&
              players?.updatedPlayers
                ?.filter(
                  (x) =>
                    x.playerTeam.toString() === fixture?.teamHomeId?.toString()
                )
                ?.map((player) => (
                  <div key={player._id}>
                    <input
                      onChange={onChange}
                      type="checkbox"
                      value={player._id}
                      name="player"
                      id={player.appName}
                    />
                    <label htmlFor={player.appName}>{player.appName}</label>
                  </div>
                ))}

            {homeAway === "away" &&
              players?.updatedPlayers
                ?.filter(
                  (x) =>
                    x.playerTeam.toString() === fixture?.teamAwayId?.toString()
                )
                ?.map((player) => (
                  <div key={player._id}>
                    <input
                      onChange={onChange}
                      type="checkbox"
                      value={player._id}
                      name="player"
                      id={player.appName}
                    />
                    <label htmlFor={player.appName}>{player.appName}</label>
                  </div>
                ))}
          </div>
          <div className="py-2">
            <select
              className="w-full px-3 py-1 border rounded"
              name="value"
              id="value"
              onChange={onChange}
            >
              <option value="">Select Value</option>
              {[-1, 1].map((val, idx) => (
                <option key={idx} value={+val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
          <div className="py-2 flex justify-between space-x-3">
            <button onClick={handleClose} className="px-3 py-1 border rounded">
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStatsModal;
