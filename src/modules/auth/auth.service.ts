import argon2d from "argon2";
import { AppError } from "../../class/appError.js";
import { IUserParams } from "../../custom.js";
import { TLoginParams, TRegisterParams } from "./auth.schemas.js";
import UserRepository from "../user/user.repository.js";
import AuthHelper from "./auth.helper.js";
import { AuthRepository } from "./auth.repository.js";
import { FOURTEEN_DAYS_IN_MS } from "../../constant/time.constant.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";

export default class AuthService {
  private db: TPrisma;
  constructor(
    private userRepo: UserRepository,
    private authRepo: AuthRepository,
  ) {
    this.db = prisma;
  }

  public register = async (params: TRegisterParams) => {
    const checkUser = await this.userRepo.findUserByEmail(params.email);
    if (checkUser) {
      throw new AppError(409, "Email is already registered");
    }

    const hashedPass = await argon2d.hash(params.password);
    const createdUser = await this.userRepo.createUser({
      ...params,
      password: hashedPass,
    });

    const user = AuthHelper.toUserPayload(createdUser);

    return {
      accessToken: AuthHelper.generateAccessToken(user),
      user,
    };
  };

  public login = async (params: TLoginParams) => {
    const user = await this.userRepo.findUserByEmail(params.email);
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isMatch = await argon2d.verify(user.password, params.password);
    if (!isMatch) {
      throw new AppError(401, "Invalid email or password");
    }

    const payload: IUserParams = AuthHelper.toUserPayload(user);

    const accessToken = AuthHelper.generateAccessToken(payload);

    const { refreshToken, hashedToken } = AuthHelper.generateRefreshToken();
    const refreshPayload = {
      userId: user.id,
      hashedToken,
      expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
    };

    await this.authRepo.createRefreshToken(refreshPayload);

    return {
      refreshToken,
      data: { accessToken, user: payload },
    };
  };

  public refreshToken = async (oldRefreshToken: string) => {
    try {
      const oldHashedToken = AuthHelper.tokenHasher(oldRefreshToken);
      const checkToken =
        await this.authRepo.findRefreshTokenByHashedToken(oldHashedToken);
      if (!checkToken)
        return {
          refreshToken: "",
          data: {
            accessToken: "",
            user: {},
          },
        };
      const payload = AuthHelper.toUserPayload(checkToken.user);

      const { hashedToken, refreshToken } = AuthHelper.generateRefreshToken();
      const refreshTokenPayload = {
        userId: checkToken.userId,
        hashedToken,
        expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
      };

      await this.db.$transaction(async (tx) => {
        await this.authRepo.deleteRefreshTokenByHashedToken(oldHashedToken, tx);
        await this.authRepo.createRefreshToken(refreshTokenPayload, tx);
      });

      return {
        refreshToken: refreshToken,
        data: {
          accessToken: AuthHelper.generateAccessToken(payload),
          user: payload,
        },
      };
    } catch (error) {
      throw error;
    }
  };

  public logout = async (oldRefreshToken: string) => {
    try {
      const oldHashedToken = AuthHelper.tokenHasher(oldRefreshToken);
      const checkToken =
        await this.authRepo.findRefreshTokenByHashedToken(oldHashedToken);
      if (!checkToken) return;

      await this.authRepo.deleteRefreshTokenByHashedToken(oldHashedToken);

      return;
    } catch (error) {
      console.error("Failed to delete refresh token during logout:", error);
      return;
    }
  };
}
