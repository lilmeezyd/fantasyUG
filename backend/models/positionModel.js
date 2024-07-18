import mongoose from 'mongoose'
const positionSchema = mongoose.Schema({
    pluralName: {
        type: String,
        required: [ true, 'Please add field']
    },
    singularName: { 
        type: String,
        required: [ true, 'Please add field']
    },
    shortName: {
        type: String,
        required: [ true, 'Please add field']
    }
})

const Position = mongoose.model('Position', positionSchema)
export default Position