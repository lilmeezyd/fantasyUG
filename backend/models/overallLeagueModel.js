import mongoose from 'mongoose'
const overallLeagueSchema = mongoose.Schema({
    name : {
        type: String,
        required: true
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
        ref: 'User',
        required: true
    },
    entrants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
    }
}, {
    timestamps: true,
})
const OverallLeague = mongoose.model("OverallLeague", overallLeagueSchema);
export default OverallLeague;