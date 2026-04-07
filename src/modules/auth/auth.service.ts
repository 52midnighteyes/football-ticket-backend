import argon2d from "argon2";
import type { IUserParams } from "../../custom.js";
import type { TLoginParams, TRegisterParams } from "./auth.schemas.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  toUserPayload,
} from "./auth.helper.js";
import {
  checkRefferalCode,
  createRefreshToken,
  findRefreshTokenByHashedToken,
  findUserByReferralCode,
  revokeManyRefreshTokenByHashedToken,
  updateManyRefreshTokenByHashedToken,
} from "./auth.repository.js";
import { FOURTEEN_DAYS_IN_MS } from "../../constant/time.constant.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { createUser, findUserByEmail } from "../user/user.repository.js";
import { AppError } from "../../class/appError.js";
import { compileHandlebars } from "../../helper/handlebars.js";
import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";
import { generateReferralCode } from "../../helper/stringGenerator.js";

export const registerService = async (params: TRegisterParams) => {
  let referralCode = "";
  let referralLength = 6;
  let referrerUserId: string | undefined = "";

  try {
    const checkUser = await findUserByEmail(params.email);
    if (checkUser) {
      throw new AppError(409, "Email is already registered");
    }

    referralCode = generateReferralCode(referralLength);
    let checkDuplicateRef = await checkRefferalCode(referralCode);
    while (checkDuplicateRef) {
      referralCode = generateReferralCode(referralLength);
      checkDuplicateRef = await checkRefferalCode(referralCode);
      referralLength++;
    }

    const { referrerCode, password, ...data } = params;
    if (referrerCode) {
      referrerUserId = (await findUserByReferralCode(referrerCode))?.id;
    }

    const passwordHash = await argon2d.hash(password);
    const user = await createUser({
      ...data,
      passwordHash,
      referralCode,
      ...(referrerUserId && { referrerUserId }),
    });

    const welcomeMessage = "Welcome to MATCHPASS";
    const html = await compileHandlebars(
      EMAIL_TEMPLATES_DIR,
      "register.mail.hbs",
      {
        name: `${user.firstName} ${user.lastName}`,
      }
    );

    await sendMail(user.email, welcomeMessage, html);
  } catch (error) {
    throw error;
  }
};

export const loginService = async (params: TLoginParams) => {
  const user = await findUserByEmail(params.email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await argon2d.verify(user.passwordHash, params.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload: IUserParams = toUserPayload(user);

  const accessToken = generateAccessToken(payload);

  const { refreshToken, hashedToken } = generateRefreshToken();
  const refreshPayload = {
    userId: user.id,
    hashedToken,
    expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
  };

  await createRefreshToken(refreshPayload);

  return {
    refreshToken,
    data: { accessToken, user: payload },
  };
};

export const refreshTokenService = async (oldRefreshToken: string) => {
  try {
    const oldHashedToken = hashToken(oldRefreshToken);
    const { hashedToken, refreshToken } = generateRefreshToken();

    return await prisma.$transaction(async (tx) => {
      const checkToken = await findRefreshTokenByHashedToken(
        oldHashedToken,
        tx
      );

      if (
        !checkToken ||
        checkToken.usedAt !== null ||
        checkToken.revokedAt !== null
      ) {
        return {
          refreshToken: null,
          data: null,
        };
      }

      const payload = toUserPayload(checkToken.user);

      const refreshTokenPayload = {
        userId: checkToken.userId,
        hashedToken,
        expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
      };

      const consume = await updateManyRefreshTokenByHashedToken(
        oldHashedToken,
        tx
      );

      if (consume.count === 0)
        return {
          refreshToken: null,
          data: null,
        };

      await createRefreshToken(refreshTokenPayload, tx);

      return {
        refreshToken,
        data: {
          accessToken: generateAccessToken(payload),
          user: payload,
        },
      };
    });
  } catch (error) {
    throw error;
  }
};

export const logoutService = async (oldRefreshToken: string) => {
  try {
    const oldHashedToken = hashToken(oldRefreshToken);
    const checkToken = await findRefreshTokenByHashedToken(oldHashedToken);
    if (!checkToken) return;

    const revokeToken = await revokeManyRefreshTokenByHashedToken(
      oldHashedToken
    );
    if (revokeToken.count === 0)
      throw new AppError(500, "Failed to delete refresh token during logout");

    return;
  } catch (error) {
    console.error("Failed to delete refresh token during logout:", error);
    return;
  }
};

export const verifyUserService = async (id: string) => {
  try {
  } catch (error) {
    throw error;
  }
};
