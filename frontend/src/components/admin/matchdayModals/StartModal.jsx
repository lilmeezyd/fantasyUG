import { Modal, Button } from "react-bootstrap"

const StartModal = (props) => {
    const {show, closeStart, cancelStart, startMatchdayNow} = props 
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Start Matchday</h3>
        <p>
          Are you sure?
        </p>
        <div className="py-2 flex justify-between space-x-3">
          <button onClick={cancelStart} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={startMatchdayNow}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
    )
  }

export default StartModal