import { Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useGetQuery } from "../../../slices/teamApiSlice";
import { useGetMatchdaysQuery } from "../../../slices/matchdayApiSlice";
import {
  useGetFixtureQuery,
  useEditFixtureMutation,
} from "../../../slices/fixtureApiSlice";

const EditModal = (props) => {
  const { show, closeEdit, resetEdit, fixtureId } = props;
  const { data: fixture = {} } = useGetFixtureQuery(fixtureId);
  const { data: teams } = useGetQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const [editFixture] = useEditFixtureMutation();
  const [data, setData] = useState({
    teamHome: '', teamAway: '',
    matchday: '', kickOff: '', time: ''
  })
  const { teamHome, teamAway, matchday, kickOff, time } = data;
  console.log(fixture)

  useEffect(() => {
    if (fixtureId) {
    setData({
      teamHome: fixture?.teamHome,
      teamAway: fixture?.teamAway,
      matchday: fixture?.matchday,
      kickOff: fixture?.kickOffTime?.substring(0, 10),
      time: fixture?.kickOffTime?.substring(11, 23)
    });
  }
  }, [
    fixture?.teamHome,
    fixture?.teamAway,
    fixture?.matchday,
    fixture?.kickOffTime,
  ]);
  const onSubmit = async (e) => {
    e.preventDefault();
    const { elements } = e.currentTarget;
    const teamHome = elements.hteam.value;
    const date = elements.kickoff.value
    const time = elements.time.value
    const kickOffTime = new Date(date + '/' + time);
    const teamAway = elements.ateam.value;
    const matchday = elements.matchday.value;

    if (teamHome === teamAway) {
      alert("Home and Away teams must be different.");
      return;
    }


    if (teamAway && teamHome && kickOffTime && matchday) {
      await editFixture({
        id: fixtureId,
        teamAway,
        teamHome,
        kickOffTime,
        matchday,
      });
      closeEdit();
      resetEdit();
    }
  };
  if (!fixture) {
    return (
      <section>
        <h4>Fixture not found!</h4>
      </section>
    );
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Edit Fixture</h6>
        <form onSubmit={onSubmit}>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="matchday">Matchday</label>
          <select
          value={matchday}
            onChange={(e) => {
                  setData(prev => ({
                    ...prev, matchday: e.target.value
                  }))
                }}
            name="matchday" id="matchday"
            className="w-full px-3 py-1 border rounded"
            type="text"
          >
            <option value="">---Select Matchday---</option>
            {matchdays?.map(matchday => 
                    <option key={matchday._id} value={matchday._id}>
                      {matchday.name}
                    </option>
                  )}
          </select>
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="kickoff">Date</label>
          <input name="kickoff" id="kickoff" type="date"
          value={kickOff}
            onChange={(e) => {
                  setData(prev => ({
                    ...prev, kickOff: e.target.value
                  }))
                }}
            className="w-full px-3 py-1 border rounded"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="time">Time</label>
          <input
          value={time}
            onChange={(e) => {
                setData((prev) => ({
                  ...prev, time: e.target.value
                }))
              }} name="time" id="time"
            className="w-full px-3 py-1 border rounded"
            type="time"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="hteam">Home Team</label>
          <select value={teamHome} onChange={(e) => {
                  setData(prev => ({
                    ...prev, teamHome: e.target.value
                  }))
                }} className="w-full px-3 py-1 border rounded" name="hteam" id="hteam">
                      <option value="">---Select---</option>
                  {teams?.map(team => 
                    <option 
                    key={team._id} 
                    value={team._id}
                    >{team.name}</option>
                  )}
                </select>
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="ateam">Away Team</label>
          <select value={teamAway} onChange={(e) => {
                  setData(prev => ({
                    ...prev, teamAway: e.target.value
                  }))
                }} className="w-full px-3 py-1 border rounded" name="ateam" id="ateam">
                      <option value="">---Select---</option>
                  {teams?.map(team => 
                    <option 
                    key={team._id} 
                    value={team._id}
                    >{team.name}</option>
                  )}
                </select>
        </div>
        <div className="py-2 flex justify-between space-x-3">
          <button onClick={closeEdit} className="px-3 py-1 border rounded">
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

export default EditModal;
