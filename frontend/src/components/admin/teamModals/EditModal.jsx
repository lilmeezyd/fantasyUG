import { Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useGetTeamQuery, useEditMutation } from "../../../slices/teamApiSlice";
import { toast } from "react-toastify";

const EditModal = (props) => {
  const { closeEdit, resetEdit, teamId } = props;
  const { data: team, refetch } = useGetTeamQuery(teamId);
  const [data1, setData1] = useState({ name: "", shortName: "", code: "" });
  const { name, shortName, code } = data1;
  const [edit] = useEditMutation();

  useEffect(() => {
    setData1({
      name: team?.name,
      shortName: team?.shortName,
      code: team?.code,
    });
  }, [team?.name, team?.shortName, team?.code]);
  const onSubmit = async (e) => {
    e.preventDefault();
    const { elements } = e.currentTarget;
    const name = elements.tname.value;
    const shortName = elements.sname.value;
    const code = +elements.code.value;

    if (name && shortName && code) {
      try {
        const res = await edit({
          id: team._id,
          name,
          shortName,
          code,
        }).unwrap();
        toast.success(res?.name);
        closeEdit();
        resetEdit();
      } catch (error) {
        toast.error("Update failed!");
        closeEdit();
        resetEdit();
      }
    }
    refetch();
  };
  if (!team) {
    return (
      <section>
        <h4>Team not found!</h4>
      </section>
    );
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h6 className="text-lg font-bold">Edit Team</h6>
        <form onSubmit={onSubmit} action="">
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="tname">
              Team Name
            </label>
            <input
              onChange={(e) => {
                setData1((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
              }}
              value={name}
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
                setData1((prev) => ({
                  ...prev,
                  shortName: e.target.value,
                }));
              }}
              value={shortName}
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
                setData1((prev) => ({
                  ...prev,
                  code: +e.target.value,
                }));
              }}
              value={code}
              id="code"
              className="w-full px-3 py-1 border rounded"
              type="number"
            />
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
