import { useState } from "react";
import {
  useGetPositionsQuery,
  useAddPositionMutation,
  useDeletePositionMutation,
} from "../../slices/positionApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import { BsPencilFill } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import AddModal from "./positionModals/AddModal";
import DeleteModal from "./positionModals/DeleteModal";
import EditModal from "./positionModals/EditModal";

const Positions = () => {
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [positionId, setPositionId] = useState("");
  const { data: positions = [], isLoading } = useGetPositionsQuery();
  const [addPosition] = useAddPositionMutation();
  const [deletePosition] = useDeletePositionMutation();
  const { deleted, edited, added } = show;

  const closeAdd = () => {
    setShow((prevState) => ({
      ...prevState,
      added: false,
    }));
  };
  const closeEdit = () => {
    setShow((prevState) => ({
      ...prevState,
      edited: false,
    }));
    setPositionId("");
  };
  const closeDelete = () => {
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
    setPositionId("");
  };

  const addPositionPop = () => {
    setShow((prevState) => ({
      ...prevState,
      added: true,
    }));
  };
  const editPositionPop = async (id) => {
    setShow((prevState) => ({
      ...prevState,
      edited: true,
    }));
    setPositionId(id);
  };
  const deletePositionPop = (id) => {
    setShow((prevState) => ({
      ...prevState,
      deleted: true,
    }));
    setPositionId(id);
  };

  const cancelDelete = () => {
    setPositionId("");
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
  };

  const deletePositionNow = async () => {
    try {
      await deletePosition(positionId).unwrap();
    } catch (error) {
      console.log(error);
    }
    setShow((prevState) => ({
      ...prevState,
      deleted: false,
    }));
    setPositionId("");
  };

  const submit = async (data) => {
    try {
      await addPosition(data).unwrap();
    } catch (error) {
      console.log(error);
    }
    setShow((prevState) => ({
      ...prevState,
      added: false,
    }));
    setPositionId("");
  };

  const resetEdit = async () => {
    setShow((prevState) => ({
      ...prevState,
      edited: false,
    }));
    setPositionId("");
  };

  if (isLoading) {
    return (
      <div className="spinner">
        <Spinner />
      </div>
    );
  }
  return (
    <Container>
      {positions?.length === 0 ? (
          <div className="spinner">No Data Found!</div>
        ) : (<div className="flex justify-center">
        <div className="overflow-auto min-w-[320px]">
          <table className="border rounded-lg">
            <thead>
              <tr className="border-b border-gray-500 p-2">
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">Count</th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {positions?.map((x, idx) => (
                <tr
                  className={`border border-gray-500 p-2 ${
                    idx % 2 === 1 && "bg-green-200"
                  }`}
                  key={x._id}
                >
                  <td className="team-name px-4 py-2 font-bold">
                    {x.singularName}
                  </td>
                  <td className="px-4 py-2 font-semibold text-center">
                    {x.shortName}
                  </td>
                  <td className="px-4 py-2 font-semibold text-center">
                    {x.total}
                  </td>
                  {/*<td
                    onClick={() => editPositionPop(x._id)}
                    className="border px-4 py-2 btn-click btn"
                  >
                    <BsPencilFill color="black" />
                  </td>
                  <td
                    onClick={() => deletePositionPop(x._id)}
                    className="border px-4 py-2 btn btn-click"
                  >
                    <AiFillDelete color="black" />
                  </td>*/}
                  <td className="btn-click px-4 py-2 text-center" onClick={() => editPositionPop(x._id)}>
                                    <BsPencilFill color="black" />
                                  </td>
                                  <td className="btn-click px-4 py-2 text-center" onClick={() => deletePositionPop(x._id)}>
                                    <AiFillDelete color="black" />
                                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>)}
      <div className="p-2 add-button ">
        <Button onClick={addPositionPop}>Add Position</Button>
      </div>
      {added && <AddModal submit={submit} closeAdd={closeAdd} />}
      {edited && (
        <EditModal
          positionId={positionId}
          resetEdit={resetEdit}
          closeEdit={closeEdit}
        />
      )}
      {deleted && (
        <DeleteModal
          positionId={positionId}
          deletePositionNow={deletePositionNow}
          cancelDelete={cancelDelete}
          closeDelete={closeDelete}
        />
      )}
    </Container>
  );
};

export default Positions;
