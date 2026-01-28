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
          <Button onClick={()=>startMatchdayPop(matchday._id)} className="whitespace-nowrap text:xs">Start</Button>
        </div>
        <div className="m-2">
          <Button onClick={() => editMatchdayPop(matchday._id)} className="whitespace-nowrap btn btn-warning">Edit</Button>
        </div>
        <div className="m-2">
          <Button onClick={() => deleteMatchdayPop(matchday._id)} className="whitespace-nowrap btn btn-danger">Delete</Button>
        </div>
        {matchday.current && <div className="m-2">
            <Button onClick={() => endMatchday(matchday._id)} className="whitespace-nowrap btn btn-success">End MD</Button>
        </div>}
      </div>
      {matchday.current && <div className="md-shadow overflow-auto rounded-lg flex justify-between sm:justify-center space-x-4 w-[100%] p-2 mt-1">
         <div className="m-2"><Button onClick={() => updateMDdata(matchday._id)} className="whitespace-nowrap btn btn-success">Update Data</Button></div>
          <div className="m-2"><Button onClick={() => updateTOW(matchday._id)} className="whitespace-nowrap btn btn-success">Update TOW</Button></div>
          <div className="m-2"><Button onClick={() => updateAutoSubs(matchday._id)} className="whitespace-nowrap btn btn-success">Auto subs</Button></div>
          <div className="m-2"><Button onClick={() => undoAutos(matchday._id)} className="whitespace-nowrap btn btn-success">Undo Autos</Button></div>
      </div>}
      <div className={`flex font-bold gap-4 my-1 p-2 ${(matchday.current || matchday.finished || matchday.next) && 'border-b' }`}>
        {(matchday.current || matchday.finished || matchday.next) && <div>Status:</div>}
        <div className={`${matchday.current ? 'text-red-500' : 'text-gray-900'}`}>{matchday.current && 'Live'}
            {matchday.finished && 'Finished'}
            {matchday.next && 'Next Matchday'}
        </div>
      </div>
    </div>
  );
};

export default MatchdayAdmin;

/*
<div className="teams p-2" key={x._id}>
          <div className="team-name">{x.name}</div>
          <div>{getTime(x.deadlineTime)}</div>
          <div><Button onClick={()=>startMatchdayPop(x._id)}>Start</Button></div>
          <div><Button onClick={() => editMatchdayPop(x._id)} className="btn btn-warning">Edit</Button></div>
          <div><Button onClick={() => deleteMatchdayPop(x._id)} className="btn btn-danger">Delete</Button></div>
          <div><Button onClick={() => updateMDdata(x._id)} className="btn btn-success">Update Data</Button></div>
          <div><Button onClick={() => updateTOW(x._id)} className="btn btn-success">Update TOW</Button></div>
          <div><Button onClick={() => updateAutoSubs(x._id)} className="btn btn-success">Auto subs</Button></div>
          <div><Button onClick={() => undoAutos(x._id)} className="btn btn-success">Undo Autos</Button></div>
          <div><Button onClick={() => endMatchday(x._id)} className="btn btn-success">End MD</Button></div>
      </div> */
