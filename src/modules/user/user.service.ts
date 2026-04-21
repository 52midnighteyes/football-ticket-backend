import { AppError } from "../../class/appError.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../libs/cloudinary/cloudinary.lib.js";
import { toUserPayload } from "../auth/auth.helper.js";
import {
  findUserByEmail,
  findUserById,
  findUserByReferralCode,
  updateUserAvatar,
} from "./user.repository.js";

export const getUserService = async (id: string) => {
  try {
    const isExist = await findUserById(id);
    if (!isExist) throw new AppError(404, "User not found");

    const user = toUserPayload(isExist);

    return user;
  } catch (error) {
    throw error;
  }
};

export const uploadUserAvatarService = async (
  id: string,
  avatarUrl: Express.Multer.File
) => {
  let isUploaded = false;
  let publicId: string = "";
  let isAvatarExist: boolean = false;
  try {
    const user = await findUserById(id);
    if (!user) throw new AppError(404, "User not found");
    isAvatarExist = !!user.avatarPublicId;

    const { public_id, secure_url } = await uploadToCloudinary(
      avatarUrl,
      user.id,
      "AVATAR"
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

    const userPayload = toUserPayload({ ...user, avatarUrl: secure_url });
    return { user: userPayload };
  } catch (error) {
    if (isUploaded && isAvatarExist) deleteFromCloudinary(publicId);
    throw error;
  }
};

export const checkUserByReferralCodeService = async (referralCode: string) => {
  try {
    const isExist = await findUserByReferralCode(referralCode);
    if (!isExist) return 0;
    return 1;
  } catch (error) {
    throw error;
  }
};

export const checkUserByEmailService = async (email: string) => {
  try {
    const isExist = await findUserByEmail(email);
    if (!isExist) return 0;
    return 1;
  } catch (error) {
    throw error;
  }
};

export const meService = async (id: string) => {
  try {
    const isExist = await findUserById(id);
    if (!isExist) throw new AppError(404, "User not found");

    const user = toUserPayload(isExist);

    return user;
  } catch (error) {
    throw error;
  }
};
