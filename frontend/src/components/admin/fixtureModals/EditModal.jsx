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
  const { data: fixture } = useGetFixtureQuery(fixtureId);
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
    /*const dt = new Date(fixture?.kickOffTime)
    console.log(fixture)
    console.log(fixture?.kickOffTime)
    console.log(dt)*/
    setData({
      teamHome: fixture?.teamHome,
      teamAway: fixture?.teamAway,
      matchday: fixture?.matchday,
      kickOff: new Date(fixture?.kickOffTime),
      time: new Date(fixture?.kickOffTime).toTimeString().split(":").slice(0, 2).join(":")
    });
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
    <Modal show={show} onHide={closeEdit}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
        <Modal.Title>
          <div className="info-details">Edit Fixture</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <form onSubmit={onSubmit} action="">
            <div className="form-group my-2">
              <label className="py-2" htmlFor="matchday">
                Matchday
              </label>
              <select
                name="matchday"
                id="matchday"
                className="form-control"
                value={matchday}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    matchday: e.target.value,
                  }));
                }}
              >
                {matchdays?.map((md) => (
                  <option key={md?._id} value={md?._id}>
                    {md?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="kickoff">Date</label>
              <input name="kickoff" id="kickoff" type="date"
                value={kickOff}
                className="form-control"
                onChange={(e) => {
                  setData(prev => ({
                    ...prev, kickOff: e.target.value
                  }))
                }}
              />

            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="time">Time</label>
              <input
                value={time}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev, time: e.target.value
                  }))
                }} name="time" id="time" className="form-control" type="time" />
            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="hteam">
                Home Team
              </label>
              <select
                name="hteam"
                id="hteam"
                className="form-control"
                value={teamHome}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    teamHome: e.target.value,
                  }));
                }}
              >
                {teams?.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="ateam">
                Away Team
              </label>
              <select
                name="ateam"
                id="ateam"
                className="form-control"
                value={teamAway}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    teamAway: e.target.value,
                  }));
                }}
              >
                {teams?.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className=" py-2 my-2">
              <Button type="submit" className="btn-success form-control">
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EditModal;
