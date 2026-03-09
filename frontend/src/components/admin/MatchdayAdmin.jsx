import React from "react";
import { Button, Spinner } from "react-bootstrap";

const MatchdayAdmin = (props) => {
  const {
    matchday,
    startMatchdayPop,
    editMatchdayPop,
    deleteMatchdayPop,
    updateMDdata,
    updateTOW,
    updateAutoSubs,
    undoAutos,
    endMatchday,
    endMatchdayDataLoading,
    updateMatchdayDataLoading,
    updateMatchdayTOWLoading,
    createAutosForMdLoading,
    undoAutosForMdLoading,
  } = props;
  return (
    <div key={matchday.id}>
      <div className="deadline">
        <h3 className="font-bold">Matchday {matchday.id}</h3>
        <h4 className="font-semibold">Deadline:</h4>
        <div className="flex justify-center w-[50%]">
          <h4 className="p-2">{matchday.deadlineDate},</h4>
          <h4 className="p-2 whitespace-nowrap ">{matchday.deadlineTime1}</h4>
        </div>
      </div>
      <div className="md-shadow overflow-auto rounded-lg flex justify-between sm:justify-center space-x-4 w-[100%] p-2 mb-1">
        <div className="m-2">
          <Button
            onClick={() => startMatchdayPop(matchday._id)}
            className="whitespace-nowrap text:xs"
          >
            Start
          </Button>
        </div>
        <div className="m-2">
          <Button
            onClick={() => editMatchdayPop(matchday._id)}
            className="whitespace-nowrap btn btn-warning"
          >
            Edit
          </Button>
        </div>
        <div className="m-2">
          <Button
            onClick={() => deleteMatchdayPop(matchday._id)}
            className="whitespace-nowrap btn btn-danger"
          >
            Delete
          </Button>
        </div>
        {!matchday.finished && matchday.current && (
          <div className="m-2">
            <Button
              onClick={() => endMatchday(matchday._id)}
              className="whitespace-nowrap btn btn-success"
            >
              End MD
            </Button>
          </div>
        )}
      </div>
      {!matchday.finished && matchday.current && (
        <div className="md-shadow overflow-auto rounded-lg flex justify-between sm:justify-center space-x-4 w-[100%] p-2 mt-1">
          <div className="m-2">
            <Button
              onClick={() => updateMDdata(matchday._id)}
              className="whitespace-nowrap btn btn-success"
            >
              {updateMatchdayDataLoading ? <Spinner /> : 'Update Data'}
            </Button>
          </div>
          <div className="m-2">
            <Button
              onClick={() => updateTOW(matchday._id)}
              className="whitespace-nowrap btn btn-success"
            >
              {updateMatchdayTOWLoading ? <Spinner /> : 'Update TOW'}
            </Button>
          </div>
          <div className="m-2">
            <Button
              onClick={() => updateAutoSubs(matchday._id)}
              className="whitespace-nowrap btn btn-success"
            >
              {createAutosForMdLoading ? <Spinner /> : 'Auto subs'}
            </Button>
          </div>
          <div className="m-2">
            <Button
              onClick={() => undoAutos(matchday._id)}
              className="whitespace-nowrap btn btn-success"
            >
              {undoAutosForMdLoading ? <Spinner /> : 'Undo Autos'}
            </Button>
          </div>
        </div>
      )}
      <div
        className={`flex font-bold gap-4 my-1 p-2 ${(matchday.current || matchday.finished || matchday.next) && "border-b"}`}
      >
        {(matchday.current || matchday.finished || matchday.next) && (
          <div>Status:</div>
        )}
        <div
          className={`${(matchday.finished || matchday.next ) ? "text-gray-900" : "text-red-500"}`}
        >
          {!matchday.finished && matchday.current && "Live"}
          {matchday.finished && "Finished"}
          {matchday.next && "Next Matchday"}
        </div>
      </div>
    </div>
  );
};

export default MatchdayAdmin;
