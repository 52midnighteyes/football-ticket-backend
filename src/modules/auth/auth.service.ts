import argon2d, { argon2id } from "argon2";
import type { IUserParams } from "../../custom.js";
import type { TLoginParams, TRegisterParams } from "./auth.schemas.js";
import Jwt from "jsonwebtoken";
import {
  comparePassword,
  createUserWithUniqueReferral,
  generateJwtToken,
  generateRefreshToken,
  handleReferral,
  hashPasword,
  hashToken,
  toUserPayload,
} from "./auth.helper.js";
import {
  createRefreshToken,
  findRefreshTokenByHashedToken,
  revokeManyRefreshTokenByHashedToken,
  updateManyRefreshTokenByHashedToken,
  verifyUserById,
} from "./auth.repository.js";
import { FOURTEEN_DAYS_IN_MS } from "../../constant/time.constant.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../user/user.repository.js";
import { AppError } from "../../class/appError.js";
import { compileHandlebars } from "../../helper/handlebars.js";
import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";
import {
  FRONTEND_URL,
  JWT_SECRET,
  VERIFY_TOKEN_SECRET,
} from "../../config/config.js";
import {
  jwtTokenSchema,
  TJwtTokenPayload,
} from "../../middlewares/tokenVerification/tokenVerification.schema.js";

export const registerService = async (params: TRegisterParams) => {
  let referrerUserId: string | null = null;
  let emailSent = true;
  const { referrerCode, password, ...data } = params;
  const fullName = params.firstName + " " + params.lastName;

  try {
    const checkUser = await findUserByEmail(params.email);
    if (checkUser) {
      throw new AppError(409, "Email is already registered");
    }

    if (referrerCode) {
      referrerUserId = await handleReferral(referrerCode);
    }

    const passwordHash = await hashPasword(password);
    const userPayload = {
      ...data,
      passwordHash,
      ...(referrerUserId && { referrerUserId }),
    };

    const user = await createUserWithUniqueReferral(fullName, userPayload);
    const payload = toUserPayload(user);
    const verifyToken = generateJwtToken(payload, VERIFY_TOKEN_SECRET, "30d");

    const welcomeMessage = "Welcome to MATCHPASS";
    const html = await compileHandlebars(
      EMAIL_TEMPLATES_DIR,
      "register.mail.hbs",
      {
        name: fullName,
        url: `${FRONTEND_URL}/verify/${verifyToken}`,
      },
    );

    try {
      await sendMail(user.email, welcomeMessage, html);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      emailSent = false;
    }

    return emailSent;
  } catch (error) {
    throw error;
  }
};

export const loginService = async (params: TLoginParams) => {
  const user = await findUserByEmail(params.email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await comparePassword(user.passwordHash, params.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload: IUserParams = toUserPayload(user);

  const accessToken = generateJwtToken(payload, JWT_SECRET, "15m");

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
        tx,
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
        tx,
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
          accessToken: generateJwtToken(payload, JWT_SECRET, "15m"),
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

    const revokeToken =
      await revokeManyRefreshTokenByHashedToken(oldHashedToken);
    if (revokeToken.count === 0)
      throw new AppError(500, "Failed to delete refresh token during logout");

    return;
  } catch (error) {
    console.error("Failed to delete refresh token during logout:", error);
    return;
  }
};

export const verifyUserService = async (token: string) => {
  try {
    const data: TJwtTokenPayload = jwtTokenSchema.parse(
      Jwt.verify(token, VERIFY_TOKEN_SECRET),
    );
    const user = await findUserById(data.id);
    if (!user) throw new AppError(404, "credentials not found");
    if (user.isVerified) throw new AppError(409, "User is already verified");

    await verifyUserById(data.id);
  } catch (error) {
    throw error;
  }
};
