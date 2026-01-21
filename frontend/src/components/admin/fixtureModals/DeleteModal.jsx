import { Modal, Button } from "react-bootstrap"

const DeleteModal = (props) => {
  const {show, closeDelete, cancelDelete, deleteFixtureNow} = props
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
        <p>
          Are you sure you want to delete?
        </p>
        <div className="py-2 flex justify-between space-x-3">
          <button onClick={cancelDelete} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={deleteFixtureNow}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal