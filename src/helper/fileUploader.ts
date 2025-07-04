import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import fs from "fs";
import { unlink } from "fs/promises";
import { IFile } from "../app/interfaces/file";

cloudinary.config({
  cloud_name: config.cloudinary.cloudinary_cloud_name,
  api_key: config.cloudinary.cloudinary_api_key,
  api_secret: config.cloudinary.cloudinary_api_secret,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const uploadToCloudinary = async (file: IFile) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      public_id: file.originalname,
    });
    console.log(uploadResult);
    //fs.unlinkSync(file.path);
    await unlink(file.path);
    return uploadResult;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    throw error;
  }
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
