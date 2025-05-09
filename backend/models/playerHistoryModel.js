import mongoose from 'mongoose'

const playerHistorySchema = mongoose.Schema({
    matchday: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add matchday'],
        ref: 'Matchday'
    },
    fixture: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add fixture'],
        ref: 'Fixture'
    },
    opponent: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add opponent'],
        ref: 'Team'
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add player'],
        ref: 'Player'
    },
    home: {
        type: Boolean,
        required: [true, 'Please add venue']
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
    starts: {
        type: Number,
        default: 0
    },
    bench: {
        type: Number,
        default: 0
    },
    bestPlayer: {
        type: Number,
        default: 0
    },
}, {strict: false})

playerHistorySchema.index({ matchday: 1, fixture: 1 });
playerHistorySchema.index({ player: 1, matchday: 1 });


const PlayerHistory = mongoose.model('PlayerHistory', playerHistorySchema)
export default PlayerHistory