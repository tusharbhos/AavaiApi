import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from 'fs'
import { v4 as uuid } from 'uuid'


const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuid()
        cb(null, file.originalname + '-' + uniqueSuffix + ".jpeg")
    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb({
            message: 'Unsupported File Format'
        },
            false)
    }
};

export const productImgResize = async (req, res, next) => {
    if (!req.files) return next();
    await Promise.all(
        req.files.map(async (file) => {
            await sharp(file.path)
                .resize(300, 300)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/images/${file.filename}`);
            fs.unlinkSync(`public/images/${file.filename}`)
        })
    );
    next();
};

export const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
