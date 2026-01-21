     import mongoose from 'mongoose'

const teamSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [ true, 'Please add team name']
        },
        shortName: {
            type: String,
            required: [ true, 'Please add short format of team name']
        },
        code: {
            type: Number,
            required: [ true, 'Please add team code'],
            unique: true
        },
        played: {
            type: Number,
            default: 0
        },
        draw: {
            type: Number,
            default: 0
        },
        win: {
            type: Number,
            default: 0
        },
        loss: {
            type: Number,
            default: 0
        },
        goalsScored: {
            type: Number,
            default: 0
        },
        goalsConceded: {
            type: Number,
            default: 0
        },
        points: {
            type: Number,
            default: 0
        }
   })
const Team = mongoose.model("Team", teamSchema);
export default Team;