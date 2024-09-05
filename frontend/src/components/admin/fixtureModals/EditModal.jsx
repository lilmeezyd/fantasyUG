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
  const [data, setData] = useState({
    teamHome: "",
    teamAway: "",
    matchday: "",
    kickOffTime: "",
  });
  const { teamHome, teamAway, matchday, kickOffTime } = data;
  const { data: teams } = useGetQuery();
  const { data: matchdays } = useGetMatchdaysQuery();
  const [editFixture] = useEditFixtureMutation();

  useEffect(() => {
    setData({
      teamHome: fixture?.teamHome,
      kickOffTime: fixture?.kickOffTime,
      teamAway: fixture?.teamAway,
      matchday: fixture?.matchday,
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
    const kickOffTime = elements.kickoff.value;
    const teamAway = elements.ateam.value;
    const matchday = elements.matchday.value;

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
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    matchday: e.target.value,
                  }));
                }}
              >
                {matchdays?.map((matchday) => (
                  <option key={matchday?._id} value={matchday?._id}>
                    {matchday?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="hteam">
                Kickoff time
              </label>
              <input
                name="kickoff"
                id="kickoff"
                type="date"
                value={kickOffTime}
                className="form-control"
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    kickOffTime: e.target.value,
                  }));
                }}
              />
            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="hteam">
                Home Team
              </label>
              <select
                name="hteam"
                id="hteam"
                className="form-control"
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    teamHome: e.target.value,
                  }));
                }}
              >
                {teams?.map((team) => (
                  <option key={team._id} value={teamHome}>
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
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    teamAway: e.target.value,
                  }));
                }}
              >
                {teams?.map((team) => (
                  <option key={team._id} value={teamAway}>
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
