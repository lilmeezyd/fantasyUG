import mongoose from "mongoose";

const leagueSchema = mongoose.Schema(
  {
    name: { 
      type: String,
      required: true,
    },
    startMatchday: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Matchday',
      required: true 
  },
  endMatchday: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Matchday',
      required: true
  },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
    },
    entrants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "ManagerInfo",
    },
    standings: [],
    entryCode: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

const League = mongoose.model("League", leagueSchema);
export default League
