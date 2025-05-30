import mongoose from "mongoose";

const managerInfoSchema = mongoose.Schema(
  { 
    user: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      unique: true,
      ref: "User",
    },
    firstName: { type: String},
    lastName: { type: String},
    matchdayJoined: { type: Number, required: true},
    teamName: {
      type: String,
      required: true,
    },
    overallRanks: {},
    teamLeagues: [],
    overallLeagues: [],
    privateLeagues: [],
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

managerInfoSchema.index({ user: 1})
managerInfoSchema.index({ "teamLeagues.startMatchday": 1 });
managerInfoSchema.index({ "overallLeagues.startMatchday": 1 });


const ManagerInfo = mongoose.model("ManagerInfo", managerInfoSchema);
export default ManagerInfo
