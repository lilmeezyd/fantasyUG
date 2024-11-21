import jwt from "jsonwebtoken";
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import expressAsyncHandler from "express-async-handler";

const protect = asyncHandler(async(req, res, next) => {
    let token;
    token = req.cookies.jwt

    if(token) {
        try {
           const decoded = jwt.verify(token, process.env.JWT_SECRET) 
           req.user = await User.findById(decoded.userId).select('-password')
           next()
        } catch (error) {
            res.status(401)
            throw new Error(`Not authorized, invalid token`)
        }
    } else {
        res.status(401)
        throw new Error(`Not authorized`)
    }
})

const roles = (...allowedRoles) => {
    return(req, res, next) => {
        //console.log(allowedRoles)
        //console.log(req.user.roles)
        if(!req?.user.roles) return res.status(401).json({msg: 'Not Authorized'})
        const rolesArray = [...allowedRoles]
        const result = Object.values(req.user.roles).map(role => rolesArray.includes(role)).find(val => val === true)
        if(!result) return res.status(401).json({msg: 'Not Authorized'})
        next()
    }
}


export { protect, roles }