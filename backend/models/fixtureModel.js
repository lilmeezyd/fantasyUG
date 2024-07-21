import mongoose from 'mongoose'

const fixtureSchema = mongoose.Schema({
    matchday: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matchday',
        required: true
    },
    kickOffTime: {
        type: Date,
        required: true
    },
    stats: [],
    teamAway: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Team'
    },
    teamHome: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Team'
    },
    teamAwayScore: {
        type: Number,
        default: null
    },
    teamHomeScore: {
        type: Number,
        default: null
    }
})

const Fixture = mongoose.model('Fixture', fixtureSchema)
export default Fixture
