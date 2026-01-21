import { Modal, Button } from "react-bootstrap"

const ResetModal = (props) => {
  const {show, closeReset, cancelReset, resetFixtureNow} = props
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Confirm Reset</h3>
        <p>
          Are you sure you want to reset this fixture?
        </p>
        <div className="py-2 flex justify-between space-x-3">
          <button onClick={cancelReset} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={resetFixtureNow}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetModal