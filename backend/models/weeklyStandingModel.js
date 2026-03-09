import mongoose from "mongoose";

const weeklySchema = mongoose.Schema({
  leagueId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "League",
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ManagerInfo",
    index: true,
  },
  matchdayPoints: { type: Number, default: null },
  matchday: {
    type: Number,
    required: true,
    index: true,
  },
  oldRank: {
    type: Number,
    index: true,
  },
  rank: {
    type: Number,
    index: true,
  },
});

weeklySchema.index({ manager: 1, matchday: 1, leagueId: 1 }, { unique: true });
const Weekly = mongoose.model("Weekly", weeklySchema);
export default Weekly;
