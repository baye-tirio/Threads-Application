import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});
export const uploadAvatar = async (imageFile, userId) => {
  console.log("The profile picture to be uploaded is");
  console.log(imageFile);
  const uploadResult = (async () => {
    // if the image already exists let's delete it so that we upload a new one
    const deletionResult = await cloudinary.uploader
      .destroy(`Avatar-${userId}`)
      .catch((error) => console.log(error));
    console.log({ deletionResult });
    // Upload an image
    const uploadResult = await cloudinary.uploader
      .upload(imageFile, {
        public_id: `Avatar-${userId}`,
      })
      .catch((error) => {
        console.log("Failed to upload the avatar");
        console.log(error);
      });
    console.log(uploadResult);
    return uploadResult;
  })();
  return uploadResult;
};
export const uploadPostImage = async (imageFile) => {
  console.log("Uploading the post image to cloudinary! and the image is: ");
  console.log(imageFile);
  const uploadResult = (async () => {
    const uploadResult = await cloudinary.uploader
      .upload(imageFile)
      .catch((error) => {
        console.log(error);
      });
    console.log(uploadResult);
    return uploadResult;
  })();
  return uploadResult;
};

export const deletePostImageFromCloudinary = async (imageUrl) => {
  try {
    const publicId = imageUrl.split("//")[1].split("/").pop().split(".")[0];
    console.log("The public of id of the image trying to be deleted is:");
    console.log(publicId);
    //attempt to delete the image from cloudinary
    const deletionResult = await cloudinary.uploader
      .destroy(publicId)
      .catch((error) => console.log(error));
    console.log({ deletionResult });
    return deletionResult;
  } catch (error) {
    console.log("Unable to delete the image from cloudinary!");
    console.log(error.message);
  }
};
