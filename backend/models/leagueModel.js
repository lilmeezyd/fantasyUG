import mongoose from "mongoose";

const leagueSchema = mongoose.Schema(
  {
    name: { 
      type: String,
      required: true,
    },
    startMatchday: {
      type: mongoose.Schema.Types.Number,
      ref: "Matchday",
      required: true,
    },
    endMatchday: {
      type: mongoose.Schema.Types.Number,
      ref: "Matchday",
      default: 30,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
    },
    entrants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
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
