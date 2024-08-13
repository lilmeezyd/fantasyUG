import { useEffect, useMemo, useState } from "react";
import {
  useGetPositionsMutation,
  useGetPositionMutation,
  useAddPositionMutation,
  useDeletePositionMutation,
  useEditPositionMutation, 
} from "../../slices/positionApiSlice";
import { Container, Button, Spinner } from "react-bootstrap";
import AddModal from "./positionModals/AddModal";
import DeleteModal from "./positionModals/DeleteModal";
import EditModal from "./positionModals/EditModal";

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [show, setShow] = useState({
    edited: false,
    deleted: false,
    added: false,
  });
  const [positionId, setPositionId] = useState("");
  const [positionName, setPositionName] = useState({});
  const [curPage, setCurPage] = useState(1);
  const [page, setPage] = useState(1);
  const [ getPositions, { isLoading} ] = useGetPositionsMutation()
  const [ getPosition ] = useGetPositionMutation()
  const [addPosition ] = useAddPositionMutation()
  const [ editPosition ] = useEditPositionMutation()
  const [ deletePosition ] = useDeletePositionMutation()
  const {deleted, edited, added } = show

  useEffect(() => {
    const fetchPositions = async () => {
       try {
         const res = await getPositions().unwrap()
         setPositions(res)
       } catch (error) {
         console.log(error)
       }
   }
   fetchPositions()
 
   
 }, [getPositions])

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
  try {
    const res = await getPosition(id).unwrap();
    setPositionName(res);
  } catch (error) {
    console.log(error);
  }
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
    setPositions(positions.filter((position) => position._id !== positionId));
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
    const res = await addPosition(data).unwrap();
    setPositions((prev) => [...prev, res]);
  } catch (error) {
    console.log(error);
  }
  setShow((prevState) => ({
    ...prevState,
    added: false,
  }));
  setPositionId("");
};

const editPositionNow = async (data) => {
  try {
    const res = await editPosition(data, positionId).unwrap();
    console.log(res);
    //dispatch(setPositionDetails({...res}))
    setPositions((prev) => [...prev, res]);
  } catch (error) {
    console.log(error);
  }
  setShow((prevState) => ({
    ...prevState,
    edited: false,
  }));
  setPositionId("");
};

 if(isLoading) {
    return <div className="spinner"><Spinner /></div>
  }
  return (
  <Container>
    {positions.map(x => <div className="teams p-2" key={x._id}>
          <div className="team-name">{x.singularName}</div>
          <div>{x.shortName}</div>
          <div><Button onClick={() => editPositionPop(x._id)} className="btn btn-warning">Edit</Button></div>
          <div><Button onClick={() => deletePositionPop(x._id)} className="btn btn-danger">Delete</Button></div>
      </div>)}
      <div className="add-button p-2">
        <Button onClick={addPositionPop} className="btn btn-success">Add Position</Button>
      </div>
      <AddModal submit={submit} show={added} closeAdd={closeAdd}></AddModal>
      <EditModal
        positionName={positionName}
        editPositionNow={editPositionNow}
        show={edited}
        closeEdit={closeEdit}
      ></EditModal>
      <DeleteModal
        deletePositionNow={deletePositionNow}
        cancelDelete={cancelDelete}
        show={deleted}
        closeDelete={closeDelete}
      ></DeleteModal>
  </Container>)
};

export default Positions;
