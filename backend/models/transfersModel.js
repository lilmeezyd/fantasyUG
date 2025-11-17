import mongoose from "mongoose";

const transfersSchema = mongoose.Schema({
  manager: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "ManagerInfo",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "User",
  },
  matchday: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "Matchday",
  },
  transferIn: {
    _id: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Player",
    },
    playerTeam: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Team",
    },
    playerPosition: {
      type: Number,
      required: true,
    },
    multiplier: {
      type: Number,
    },
    nowCost: { type: Number },
    IsCaptain: { type: Boolean },
    IsViceCaptain: { type: Boolean },
    slot: { type: Number },
  },
  transferOut: {
    _id: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Player",
    },
    playerTeam: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Team",
    },
    playerPosition: {
      type: Number,
      required: true,
    },
    multiplier: {
      type: Number,
    },
    nowCost: { type: Number },
    IsCaptain: { type: Boolean },
    IsViceCaptain: { type: Boolean },
    slot: { type: Number },
  },
}, {timestamps: true});

const TransfersModel = mongoose.model("TransfersModel", transfersSchema);
export default TransfersModel;
