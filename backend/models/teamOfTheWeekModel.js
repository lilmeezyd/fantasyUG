import mongoose from "mongoose"

const TOWSchema = mongoose.Schema({
    matchday: { type: Number, required: true, unique: true},
    matchdayId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Matchday'},
    starOnes: [{
        id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Player'},
        positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true},
        playerTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true},
        totalPoints: { type: Number, required: true},
        code: { type: Number, required: true},
        player: { type: String, required: true},
        position: {type: String, required: true}
    }]
})

const TOW = mongoose.model('TOW', TOWSchema)
export default TOW