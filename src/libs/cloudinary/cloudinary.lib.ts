import {
  v2 as cloudinary,
  type UploadApiOptions,
  type UploadApiResponse,
} from "cloudinary";
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

const BASE_PARENT_FOLDER = "GROCERGO";

const uploadStreamToCloudinary = (
  file: Express.Multer.File,
  options: UploadApiOptions,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
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

export const uploadToCloudinary = (
  file: Express.Multer.File,
  id: string,
  assetType: "AVATAR" | "EVENT_BANNER" | "TRANSACTION_PROOF",
): Promise<UploadApiResponse> => {
  const assetConfig = {
    AVATAR: {
      folder: `${BASE_PARENT_FOLDER}/USERS/${id}/AVATARS`,
      publicId: `AVATAR-${id}`,
    },
    EVENT_BANNER: {
      folder: `${BASE_PARENT_FOLDER}/USERS/${id}/EVENT_BANNERS`,
      publicId: `EVENT-BANNER-${id}-${Date.now()}`,
    },
    TRANSACTION_PROOF: {
      folder: `${BASE_PARENT_FOLDER}/TRANSACTIONS/${id}/PAYMENT_PROOFS`,
      publicId: `TRANSACTION-PROOF-${id}-${Date.now()}`,
    },
  } satisfies Record<
    "AVATAR" | "EVENT_BANNER" | "TRANSACTION_PROOF",
    { folder: string; publicId: string }
  >;

  const { folder, publicId } = assetConfig[assetType];

  return uploadStreamToCloudinary(file, {
    folder,
    public_id: publicId,
    overwrite: assetType === "AVATAR",
    invalidate: true,
    resource_type: "image",
  });
};

export const uploadAvatarToCloudinary = (
  file: Express.Multer.File,
  id: string,
): Promise<UploadApiResponse> => uploadToCloudinary(file, id, "AVATAR");

export const uploadProductPhotoCloudinary = (
  file: Express.Multer.File,
  id: string,
): Promise<UploadApiResponse> => uploadToCloudinary(file, id, "EVENT_BANNER");

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

export const getPublicIdFromCloudinaryUrl = (url: string) => {
  const uploadSegment = "/upload/";
  const uploadIndex = url.indexOf(uploadSegment);

  if (uploadIndex === -1) return null;

  const pathAfterUpload = url.slice(uploadIndex + uploadSegment.length);
  const versionlessPath = pathAfterUpload.replace(/^v\d+\//, "");
  const lastDotIndex = versionlessPath.lastIndexOf(".");

  if (lastDotIndex === -1) return null;

  return versionlessPath.slice(0, lastDotIndex);
};
