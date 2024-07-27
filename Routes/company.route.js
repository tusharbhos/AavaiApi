import express from "express";
import { uploadCompanyLogo } from "../controllers/company.controller"
import { isAuthenticated } from "../middlewares/auth"
import { upload, productImgResize } from "../middlewares/uploadImages";

const companyRouter = express.Router()

companyRouter.post('/uploadlogo', isAuthenticated, upload.single('logo'), productImgResize, uploadCompanyLogo)

export default companyRouter