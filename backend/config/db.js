import mongoose from "mongoose";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const connectDB = async () => {
    const uri = `mongodb+srv://denismoini09:${process.env.PASSWORD}@fantasyug.zvubwkt.mongodb.net/ugandanDiba?retryWrites=true&w=majority&appName=fantasyUG`
    try {
        //const conn = await mongoose.connect(process.env.MONGO_URL)
        const conn = await mongoose.connect(uri, clientOptions)
        console.log(`MongoDB connect ${conn.connection.host}`)
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}

export default connectDB