import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
  // if there is no local file path
  if (!localFilePath) {
    return null;
  }

  // main uploading
  const uploadResponse = await cloudinary.uploader
    .upload(localFilePath, {
      resource_type: "auto",
    })
    .catch((error) => {
      fs.unlinkSync(localFilePath); // deletes the locally saved temporary file
      return null;
    });

  console.log("file is successfully uploaded to cloudinary");
  fs.unlinkSync(localFilePath); // deletes the locally saved temporary file
  return uploadResponse;
};

export { uploadOnCloudinary };
