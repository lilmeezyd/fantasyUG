import mongoose from 'mongoose' 

const picksSchema = mongoose.Schema({
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'ManagerInfo'
    }, 
    picks: [
       { _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true},
        playerPosition: { type: Number, required: true},
        playerTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true},
        multiplier: { type: Number, required: true},
        nowCost: { type: Number, required: true},
        IsCaptain: { type: Boolean, required: true},
        IsViceCaptain: { type: Boolean, required: true},
        slot: { type: Number, required: true}   
    }],
    teamValue: { type: Number, required: true},
    bank: { type: Number, required: true}
    
})

const Picks = mongoose.model('Picks', picksSchema)
export default Picks