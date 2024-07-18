import mongoose from 'mongoose'

const playerMatchdaySchema = mongoose.Schema({
    matchday: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add matchday'],
        ref: 'Matchday'
    },
    matchdayPoints: { 
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    goalsScored: {
        type: Number,
        default: 0
    },
    assists: {
        type: Number,
        default: 0
    },
    ownGoals: {
        type: Number,
        default: 0
    },
    penaltiesSaved: {
        type: Number,
        default: 0
    },
    penaltiesMissed: {
        type: Number,
        default: 0
    },
    yellowCards: {
        type: Number,
        default: 0
    },
    redCards: {
        type: Number,
        default: 0
    },
    saves: {
        type: Number,
        default: 0
    },
    cleansheets: {
        type: Number,
        default: 0
    },
    started: {
        type: Number,
        default: 0
    },
    offBench: {
        type: Number,
        default: 0
    },
    bestPlayer: {
        type: Number,
        default: 0
    },
})

const PlayerStats = mongoose.model('PlayerStats', playerMatchdaySchema)
export default PlayerStats