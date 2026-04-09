import { AppError } from "../../class/appError.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../libs/cloudinary/cloudinary.lib.js";
import { findUserById, updateUserAvatar } from "./user.repository.js";

export const getUserService = async (id: string) => {
  try {
    const isExist = await findUserById(id);
    if (!isExist) throw new AppError(404, "User not found");

    const { passwordHash, ...user } = isExist;

    return user;
  } catch (error) {
    throw error;
  }
};

export const uploadUserAvatarService = async (
  id: string,
  avatarUrl: Express.Multer.File,
) => {
  let isUploaded = false;
  let publicId: string = "";
  try {
    const user = await findUserById(id);
    if (!user) throw new AppError(404, "User not found");

    const { public_id, secure_url } = await uploadToCloudinary(
      avatarUrl,
      user.id,
      "AVATAR",
    );

    isUploaded = true;
    publicId = public_id;

    await updateUserAvatar({
      avatarUrl: secure_url,
      avatarPublicId: public_id,
      id: user.id,
    });

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }
  } catch (error) {
    if (isUploaded) deleteFromCloudinary(publicId);
    throw error;
  }
};
