import mongoose from "mongoose";

const transfersSchema = mongoose.Schema({
  manager: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
    ref: "ManagerInfo",
  },
  transfers: [
    {
      matchday: {
        type: mongoose.Schema.ObjectId,
        required: true,
        unique: true,
        ref: "Matchday",
      },
      mdTransfers: [
        {
          transferIn: {
            playerIn: {
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
              type: mongoose.Schema.ObjectId,
              required: true,
              ref: "Position",
            },
          },
          transferOut: {
            playerOut: {
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
              type: mongoose.Schema.ObjectId,
              required: true,
              ref: "Position",
            },
          },
          timestamps: true,
        },
      ],
    },
  ],
});

const TransfersModel = mongoose.model("TransfersModel", transfersSchema);
export default TransfersModel;
