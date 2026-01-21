import { Modal, Button } from "react-bootstrap";
import { useState } from "react";
const AddModal = (props) => {
  const { closeAdd, submit } = props;
  const [data, setData] = useState({ name: "", shortName: "", code: "" });
  const confirmAdd = (e) => {
    e.preventDefault();
    submit(data);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Add Team</h6>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="tname">
            Team Name
          </label>
          <input
            onChange={(e) => {
              setData((prev) => ({
                ...prev,
                name: e.target.value,
              }));
            }}
            name="tname"
            id="tname"
            className="w-full px-3 py-1 border rounded"
            type="text"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="sname">
            Short Name
          </label>
          <input
            onChange={(e) => {
              setData((prev) => ({
                ...prev,
                shortName: e.target.value,
              }));
            }}
            name="sname"
            id="sname"
            className="w-full px-3 py-1 border rounded"
            type="text"
          />
        </div>
        <div className="py-2">
          <label className="block text-sm font-medium" htmlFor="code">
            Team Code
          </label>
          <input
            onChange={(e) => {
              setData((prev) => ({
                ...prev,
                code: +e.target.value,
              }));
            }}
            id="code"
            className="w-full px-3 py-1 border rounded"
            type="number"
          />
        </div>
        <div className="py-2 flex justify-between space-x-3">
          <button onClick={closeAdd} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={confirmAdd}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
