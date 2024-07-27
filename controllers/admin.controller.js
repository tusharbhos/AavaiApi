import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model";
import createError from 'http-errors'
import { signAccessToken, signRefreshToken } from "../utils/jwtHelper";

export const registerAdmin = asyncHandler(async (req, res, next) => {
    try {

        const { name, email, password } = req.body

        const adminExist = await Admin.findOne({ email })
        if (adminExist) throw createError.Conflict('User already registered.')

        const newAdmin = new Admin(req.body)
        const savedAdmin = await newAdmin.save()
        const access_token = await signAccessToken(savedAdmin.id)
        const refresh_token = await signRefreshToken(savedAdmin.id)

        res.send({ access_token, refresh_token })
    
    } catch (error) {
        next(error)
    }
})