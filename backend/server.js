import express, { urlencoded } from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import connectDB from './config/db.js'
dotenv.config()

connectDB()
const app = express()
const port = process.env.PORT|| 5000
app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(cookieParser())

app.get('/', (req, res) => res.send('server ready'))
app.use('/api/users', userRoutes)
app.use(notFound)
app.use(errorHandler)
app.listen(port, () => console.log(`Server running on port ${port}`))

/*
 POST /api/users = Register a user
 POST /api/users/auth - Authenticate a user and get atoken
 POST /api/users/logout - Logout user and clear cookie
 GET /api/users/profile - Get user profile
 PUT /api/users/profile - Update user profile
*/