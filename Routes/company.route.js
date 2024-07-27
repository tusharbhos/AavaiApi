import express from "express";
import { uploadCompanyLogo, newJobPost, editJob } from "../controllers/company.controller"
import { isAuthenticated } from "../middlewares/auth"
import { upload, productImgResize } from "../middlewares/uploadImages";

const companyRouter = express.Router()

companyRouter.post('/uploadlogo', isAuthenticated, upload.single('logo'), productImgResize, uploadCompanyLogo)

// Jobs route
companyRouter.post('/newjob', isAuthenticated, newJobPost)
companyRouter.post('/editjob/:id', isAuthenticated, editJob)


export default companyRouter