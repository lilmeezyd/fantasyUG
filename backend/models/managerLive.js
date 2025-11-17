import mongoose from "mongoose";
 
const managerLiveSchema = mongoose.Schema({
  manager: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "ManagerInfo",
  },
  livePicks: [ 
    {
      matchday: {
        type: Number,
        required: true
      },
      matchdayId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Matchday'
      },
      activeChip: {
        type: String,
        default: null
      },
      matchdayPoints: {
        type: Number,
        default: null
      },
      matchdayRank: {
        type: Number,
        default: null
      },
      picks: [
        { _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true},
         playerPosition: { type: Number, required: true},
         playerTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true},
         multiplier: { type: Number, required: true},
         nowCost: { type: Number, required: true},
         IsCaptain: { type: Boolean, required: true},
         IsViceCaptain: { type: Boolean, required: true},
         slot: { type: Number, required: true},
         points: { type: Number, default: null},
         starts: { type: Number, default: null},
         bench: { type: Number, default: null}
      }
      ],
      teamValue: { type: Number},
      bank: { type: Number},
      automaticSubs: []
    }
  ],
});

managerLiveSchema.index({ manager: 1 });
managerLiveSchema.index({ "livePicks.matchdayId": 1 });


const ManagerLive = mongoose.model("ManagerLive", managerLiveSchema);
export default ManagerLive
