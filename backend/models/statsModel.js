import mongoose from 'mongoose'

const statsSchema = mongoose.Schema({
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player'}
})

const Stats = mongoose.model('Stats', statsSchema);
export default Stats;