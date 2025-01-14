import mongoose from 'mongoose'

const playerSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [ true, 'Please add first name']
    },
    secondName: { 
        type: String,
        required: [ true, 'Please add second name(s)']
    },
    appName: {
        type: String,
        required: [ true, 'Please add name to be used on app']
    },
    playerPosition: {
        type: mongoose.Schema.Types.ObjectId,
        required: [ true, 'Please add player position'],
        ref: 'Position'
    },
    playerTeam: {
        type: mongoose.Schema.Types.ObjectId,
        required: [ true, 'Please add player team' ],
        ref: 'Team'
    },
    startCost: {
        type: Number,
        required: [ true, 'Please add price']
    },
    nowCost: {
        type: Number,
        required: [ true, 'Please add price']
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
    playerCount: {
        type: Number,
        default: 0
    }

})

const Player = mongoose.model('Player', playerSchema)
export default Player