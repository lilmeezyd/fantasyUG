import mongoose from "mongoose";

const overallSchema = mongoose.Schema(
  {
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "ManagerInfo",
      index: true,
    },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "League",
      index: true
    },
    overallPoints: { type: Number, default: null },
    oldRank: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      index: true,
    },
  },
  { timestamps: true }
);

overallSchema.index({ manager: 1, leagueId: 1 }, { unique: true });
const Overall = mongoose.model("Overall", overallSchema);
export default Overall;
