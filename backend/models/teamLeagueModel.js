import mongoose from 'mongoose'
const teamLeagueSchema = mongoose.Schema({
    team : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
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
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    entrants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    }
}, {
    timestamps: true,
})
const TeamLeague = mongoose.model("TeamLeague", teamLeagueSchema);
export default TeamLeague;