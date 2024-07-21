import mongoose from "mongoose";

const playerFixtureSchema = mongoose.Schema({
  matchday: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please add matchday"],
    ref: "Matchday",
  },
  opponent: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please add opponent"],
    ref: "Team",
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Please add player"],
    ref: "Player",
  },
});

const PlayerFixture = mongoose.model("PlayerHistory", playerFixtureSchema);
export default PlayerFixture;
