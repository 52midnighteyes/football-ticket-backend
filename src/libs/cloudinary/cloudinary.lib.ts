import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";
import { AppError } from "../../class/appError.js";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../../config/config.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const BASE_PARENT_FOLDER = "TICKETING-APP";

export const uploadToCloudinary = (
  file: Express.Multer.File,
  id: string,
  type: "AVATAR" | "TRANSACTION_PROOF",
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const folder = `${BASE_PARENT_FOLDER}/${id}/${type}`;

    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error || !result) {
          return reject(
            new AppError(500, "Failed to upload image to Cloudinary", false),
          );
        }

        resolve(result);
      },
    );

    Readable.from([file.buffer]).pipe(stream);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  const action: UploadApiResponse = await cloudinary.uploader.destroy(publicId);

  if (action.result !== "ok") {
    throw new AppError(500, "Failed to delete image from Cloudinary", false);
  }

  console.log(
    "Image deleted successfully from Cloudinary",
    action.original_filename,
  );
};
