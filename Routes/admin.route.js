import express from "express"
import { registerAdmin } from "../controllers/admin.controller"


const adminRouter = express.Router()

adminRouter.post('/admin-registration', registerAdmin)

export default adminRouter