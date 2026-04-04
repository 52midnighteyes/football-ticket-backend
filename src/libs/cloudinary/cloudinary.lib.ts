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

  public upload = (
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

  public delete = async (public_id: string) => {
    try {
      const action: UploadApiResponse =
        await cloudinary.uploader.destroy(public_id);
      if (action.result !== "ok") {
        throw new AppError(
          500,
          "Failed to delete image from Cloudinary",
          false,
        );
      }
      console.log(
        "Image deleted successfully from Cloudinary",
        action.original_filename,
      );
    } catch (error) {
      throw error;
    }
  };
}

export const cloudinaryConfig = new CloudinaryConfig();
