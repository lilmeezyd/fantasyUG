import { Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";

const EditModal = (props) => {
  const { show, closeEdit, editPositionNow, matchdayName } = props;
  const [data, setData] = useState({ name: "", deadlineTime: "" });
  const { name, deadlineTime } = data;

  useEffect(() => {
    setData({ name: matchdayName.name, deadlineTime: matchdayName.deadlineTime });
  }, [matchdayName.name, matchdayName.deadlineTime]);
  const onSubmit = (e) => {
    e.preventDefault();
    editPositionNow(data);
  };
  return (
    <Modal show={show} onHide={closeEdit}>
      <Modal.Header style={{ background: "aquamarine" }} closeButton>
        <Modal.Title>
          <div className="info-details">Edit Position</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <form onSubmit={onSubmit} action="">
            <div className="form-group my-2">
              <label className="py-2" htmlFor="tname">
                Name
              </label>
              <input
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
                value={name}
                name="tname"
                id="tname"
                className="form-control"
                type="text"
              />
            </div>
            <div className="form-group my-2">
              <label className="py-2" htmlFor="sname">
                Deadline
              </label>
              <input
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    deadlineTime: e.target.value,
                  }));
                }}
                name="sname"
                id="sname"
                className="form-control"
                type="date"
                value={deadlineTime}
              />
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
