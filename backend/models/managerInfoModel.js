import mongoose from "mongoose";

const managerInfoSchema = mongoose.Schema(
  { 
    user: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      unique: true,
      ref: "User",
    },
    current: { type: Number, default: null},
    teamName: {
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
