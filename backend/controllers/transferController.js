import asyncHandler from "express-async-handler";
import TransfersModel from "../models/transfersModel.js";
import Matchday from "../models/matchdayModel.js";
import Player from "../models/playerModel.js";
import Position from "../models/positionModel.js";
import Team from "../models/teamModel.js";

const getTransfers = asyncHandler(async (req, res) => {
  const matchday = await Matchday.findOne({ current: true });
  const nextMatchday = await Matchday.findOne({ next: true });
  const teams = await Team.find({});
  const players = await Player.find({});
  const positions = await Position.find({});
  const matchdays = await Matchday.find({});
  const transfers = await TransfersModel.find({
    $or: [{ user: req.params.id }, { manager: req.params.id }],
  });

  const playerMap = new Map(players.map((x) => [x._id.toString(), x.appName]));
  const teamMap = new Map(teams.map((x) => [x._id.toString(), x.shortName]));
  const positionMap = new Map(positions.map((x) => [x.code, x.shortName]));
  const matchdayMap = new Map(matchdays.map((x) => [x._id.toString(), x.id]));
  const matchdayTransfers =
    req.params.id.toString() === req.user._id.toString()
      ? transfers.filter(
          (x) => x.matchday.toString() === nextMatchday?._id?.toString()
        ) || []
      : transfers.filter(
          (x) => x.matchday.toString() === matchday._id.toString()
        ) || [];
  const fullTransfers =
    req.params.id.toString() === req.user._id.toString()
      ? transfers
      : transfers.filter(
          (x) => x.matchday.toString() !== nextMatchday?._id?.toString()
        ) || [];
  const totalTransfers = fullTransfers?.length || 0;
  const matchdayTransfersLength = matchdayTransfers?.length || 0;
  const updatedTransfers = fullTransfers.map((transfer) => {
    return {
      transferIn: {
        appName: playerMap.get(transfer.transferIn._id.toString()),
        playerTeam: teamMap.get(transfer.transferIn.playerTeam.toString()),
        playerPosition: positionMap.get(transfer.transferIn.playerPosition),
      },
      transferOut: {
        appName: playerMap.get(transfer.transferOut._id.toString()),
        playerTeam: teamMap.get(transfer.transferOut.playerTeam.toString()),
        playerPosition: positionMap.get(transfer.transferOut.playerPosition),
      },
      createdAt: transfer.createdAt,
      matchday: matchdayMap.get(transfer.matchday.toString()),
    };
  });

  res.json({
    transfers: updatedTransfers,
    totalTransfers,
    matchdayTransfersLength,
  });
});

const getTransferDetails = asyncHandler(async (req, res) => {
  const teams = await Team.find({});
  const positions = await Position.find({});
  const players = await Player.find({});
  const nextMatchday = await Matchday.findOne({ next: true });
  //const transfers = await TransfersModel.find({matchday: nextMatchday._id})
  const transfersIn = await TransfersModel.aggregate([
    {$match: {matchday: nextMatchday?._id}},
    {
      $group: {
        _id: "$transferIn._id",
        playerTeam: { $first: "$transferIn.playerTeam" },
        playerPosition: { $first: "$transferIn.playerPosition" },
        transfersIn: { $sum: 1 },
      },
    },
  ]);
  const transfersOut = await TransfersModel.aggregate([
    {$match: {matchday: nextMatchday?._id}},
    {
      $group: {
        _id: "$transferOut._id",
        playerTeam: { $first: "$transferOut.playerTeam" },
        playerPosition: { $first: "$transferOut.playerPosition" },
        transfersOut: { $sum: 1 },
      },
    },
  ]);
  const playerMap = new Map(players.map((x) => [x._id.toString(), x.appName]));
  const teamMap = new Map(teams.map((x) => [x._id.toString(), x.name]));
  const teamCodeMap = new Map(teams.map((x) => [x._id.toString(), x.code]));
  const positionMap = new Map(positions.map((x) => [x.code, x.shortName]));
  const updatedTransfersIn = transfersIn.map((transfer) => {
    return {
      ...transfer,
      appName: playerMap.get(transfer._id.toString()),
      playerTeam: teamMap.get(transfer.playerTeam.toString()),
      playerPosition: positionMap.get(transfer.playerPosition),
      forwardImage:
        transfer.playerPosition === 1
          ? `${teamCodeMap.get(transfer.playerTeam.toString())}_1-66`
          : `${teamCodeMap.get(transfer.playerTeam.toString())}-66`,
    };
  });
  const updatedTransfersOut = transfersOut.map((transfer) => {
    return {
      ...transfer,
      appName: playerMap.get(transfer._id.toString()),
      playerTeam: teamMap.get(transfer.playerTeam.toString()),
      playerPosition: positionMap.get(transfer.playerPosition),
      forwardImage: transfer.playerPosition === 1
          ? `${teamCodeMap.get(transfer.playerTeam.toString())}_1-66`
          : `${teamCodeMap.get(transfer.playerTeam.toString())}-66`,
    };
  });
  res.json({
    transfersIn: updatedTransfersIn,
    transfersOut: updatedTransfersOut,
  });
});

export { getTransfers, getTransferDetails };
