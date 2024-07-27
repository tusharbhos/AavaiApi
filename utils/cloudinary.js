import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

export const cloudinaryUploadImg = async (file) => {
    return new Promise((resolve) => {
        cloudinary.uploader.upload(file, { folder: "CompanyLogo" }, (err, result) => {
            resolve({
                url: result.secure_url,
                asset_id: result.asset_id,
                public_id: result.public_id
            },
                {
                    resource_type: 'auto',
                });
        });
    });
};

export const cloudinaryDeleteImg = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error(error.message);
    }
};