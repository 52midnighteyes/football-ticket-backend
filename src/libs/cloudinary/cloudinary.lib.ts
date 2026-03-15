import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";
import { AppError } from "../../class/appError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

class CloudinaryConfig {
  private baseParentFolder = "persija_web";

  public cloudinaryUpload = (
    file: Express.Multer.File,
    id: string,
  ): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
      const folder = `${this.baseParentFolder}/${id}/images`;

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
}

export const cloudinaryConfig = new CloudinaryConfig();
