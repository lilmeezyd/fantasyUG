import mongoose from "mongoose";

const managerInfoSchema = mongoose.Schema(
  { 
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    mgrId: { type: Number, required: true, unique: true },
    current: { type: Number, default: null},
    teamName: {
      type: String,
      required: true,
    },
    playerName: {
      type: String,
      required: true,
    },
    leagues: [],
    matchdayPoints: {
      type: Number,
      default: 0,
    },
    matchdayRank: {
      type: Number,
      default: null,
    },
    overallPoints: {
      type: Number,
      default: 0,
    },
    overallRank: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ManagerInfo = mongoose.model("ManagerInfo", managerInfoSchema);
export default ManagerInfo
