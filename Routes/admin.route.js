import express from "express"
import { registerAdmin, loginUser, logoutUser, refreshToken } from "../controllers/admin.controller"
import { isAuthenticated } from "../middlewares/auth"

const adminRouter = express.Router()

adminRouter.post('/registration', registerAdmin)
adminRouter.post('/login', loginUser)
adminRouter.delete('/logout', logoutUser)
adminRouter.post('/refresh-token', isAuthenticated, refreshToken)

export default adminRouter