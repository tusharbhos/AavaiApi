import { Logo, Job, Contact, Service, Project, Gallery } from "../models/company.model"
import { cloudinaryUploadImg, cloudinaryDeleteImg } from '../utils/cloudinary'
import asyncHandler from "express-async-handler"
import fs from "fs"


export const uploadCompanyLogo = asyncHandler(async (req, res) => {
    try {
        // Retrieve existing logo data from the database
        const existingLogo = await Logo.findOne();

        if (existingLogo) {
            // Extract the public ID from the existing logo URL for deletion
            const publicId = existingLogo.logoUrl.split('/').pop().split('.')[0];

            // Delete the old logo from Cloudinary
            await cloudinaryDeleteImg(`CompanyLogo/${publicId}`);
        }

        // Get the uploaded file from the request
        let logo = req.file;
        const path = logo.path;

        // Upload the new logo to the "CompanyLogo" folder in Cloudinary
        const savedLogo = await cloudinaryUploadImg(path);
        console.log(savedLogo)
        // Remove the local file after upload
        fs.unlinkSync(path);

        // Save the new logo URL in the database
        if (existingLogo) {
            existingLogo.logoUrl = savedLogo.url;
            await existingLogo.save();
        } else {
            const newLogo = new Logo({ logoUrl: savedLogo.url });
            await newLogo.save();
        }

        // Respond with the new logo URL
        res.status(200).json({ message: 'Logo uploaded successfully', url: savedLogo.url });
    } catch (err) {
        res.status(500).json({ message: 'Error uploading logo', error: err.message });
    }
});