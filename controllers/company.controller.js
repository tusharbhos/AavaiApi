import { Logo, Job, Contact, Service, Project, Gallery } from "../models/company.model"
import { cloudinaryUploadImg, cloudinaryDeleteImg } from '../utils/cloudinary'
import asyncHandler from "express-async-handler"
import fs from "fs"
import createHttpError from "http-errors"


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

// New Job Upload
export const newJobPost = asyncHandler(async (req, res) => {
    try {
        let { title, description, location } = req.body
        let jobExists = await Job.findOne({ title, description, location })
        if (jobExists) throw createHttpError.Conflict('Similar type of job is already present')
        const newJob = new Job(req.body);
        await newJob.save();

        const allJobs = await Job.find()

        res.status(200).json({ message: 'New job posted successfully', jobs: allJobs });

    } catch (err) {
        res.status(500).json({ message: 'Error Posting new job', error: err.message });
    }
})

// Edit Job By ID
export const editJob = asyncHandler(async (req, res) => {
    let jobId = req.params.id
    let jobData = req.body
    try {
        let jobExists = await Job.findById({ _id: jobId })

        if (!jobExists) throw createHttpError.NotFound('Job not found')

        // Update the job with new data
        const updatedJob = await Job.findByIdAndUpdate(jobId, jobData, {
            new: true, // Return the updated document
            runValidators: true // Ensure that validators are run on the update
        });

        if (!updatedJob) {
            throw createHttpError(404, 'Job not found');
        }

        res.status(200).json({ message: 'Job edited successfully', job: updatedJob });

    } catch (err) {
        res.status(500).json({ message: 'Error Editing job', error: err.message });
    }
})