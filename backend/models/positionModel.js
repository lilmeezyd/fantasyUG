import mongoose from 'mongoose'
const positionSchema = mongoose.Schema({
    pluralName: {
        type: String,
        required: [ true, 'Please add field'],
        unique: true
    },
    singularName: { 
        type: String,
        required: [ true, 'Please add field'],
        unique: true
    },
    shortName: {
        type: String,
        required: [ true, 'Please add field'],
        unique: true
    },
    code: {
        type: Number,
        required: [ true, 'Please add field'],
        unique: true
    }
})

const Position = mongoose.model('Position', positionSchema)
export default Position