import { Modal, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import {
  useGetMatchdayQuery,
  useEditMatchdayMutation,
} from "../../../slices/matchdayApiSlice";
import { toast } from 'react-toastify';

const EditModal = (props) => {
  const { show, closeEdit, resetEdit, matchdayId } = props;
  const { data: matchday } = useGetMatchdayQuery(matchdayId);
  const [data, setData] = useState({ oldId: "", nameId: "", deadline: "", time: "" });
  const { oldId, nameId, deadline, time } = data;
  const [editMatchday] = useEditMatchdayMutation();

  useEffect(() => {
    if (matchdayId) {
      setData({
        oldId: matchday?.name?.slice(9),
        nameId: matchday?.name?.slice(9),
        deadline: matchday?.deadlineTime?.substring(0, 10),
        time: matchday?.deadlineTime?.substring(11, 23),
      });
    }
  }, [matchday?.name, matchday?.deadlineTime, matchday?.time]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const { elements } = e.currentTarget;
    const nameId = elements.matchday.value;
    const date = elements.deadline.value;
    const time = elements.time.value;
    const deadlineTime = date + "/" + time;
    const name = `Matchday ${nameId}`;

    if (nameId && date && time) {
      try {
        const res = await editMatchday({
          id: matchday?._id,
          oldId,
          name,
          deadlineTime,
        }).unwrap();
        toast.success(res?.msg)
        closeEdit();
        resetEdit();
      } catch (error) {
        console.log(error);
        toast.error(error?.data?.message)
        closeEdit();
        resetEdit();
      }
    }
  };
  if (!matchday) {
    return (
      <section>
        <h4>Matchday not found!</h4>
      </section>
    );
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full space-y-4">
        <h3 className="text-lg font-bold">Edit Matchday</h3>
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="matchday">
              Matchday
            </label>
            <input
              value={nameId}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  nameId: e.target.value,
                }));
              }}
              name="matchday"
              id="matchday"
              className="w-full px-3 py-1 border rounded"
              type="number"
            />
          </div>
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="deadline">
              Date
            </label>
            <input
              name="deadline"
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  deadline: e.target.value,
                }));
              }}
              className="w-full px-3 py-1 border rounded"
            />
          </div>
          <div className="py-2">
            <label className="block text-sm font-medium" htmlFor="time">
              Time
            </label>
            <input
              value={time}
              onChange={(e) => {
                setData((prev) => ({
                  ...prev,
                  time: e.target.value,
                }));
              }}
              name="time"
              id="time"
              className="w-full px-3 py-1 border rounded"
              type="time"
            />
          </div>
          <div className="py-2 flex justify-between space-x-3">
            <button onClick={closeEdit} className="px-3 py-1 border rounded">
              Cancel
            </button>
            <button
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
