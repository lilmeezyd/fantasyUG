import mongoose from "mongoose";

const matchdaySchema = mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: [true, "Add required field"] },
  chipsPlayed: [],
  deadlineTime: { type: Date, default: null },
  pastDeadline: { type: Boolean, default: false },
  finished: { type: Boolean, default: false },
  avergeScore: { type: Number, default: 0 },
  highestScore: { type: Number, default: 0 },
  highestScoringEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManagerInfo",
    default: null,
  },
  current: { type: Boolean, default: false },
  next: { type: Boolean, default: false },
  mostSelected: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
  mostCaptained: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
  topTransferIn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
  topTransferOut: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
  topPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    default: null,
  },
});

const Matchday = mongoose.model("Matchday", matchdaySchema);
export default Matchday;
